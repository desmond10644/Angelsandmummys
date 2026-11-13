const express = require("express");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.post("/", async (req, res) => {
  const customer = req.body.customer;
  const items = req.body.items;
  const requiredAddressFields = ["fullName", "email", "phone", "address", "city", "state"];
  if (!customer || requiredAddressFields.some(
    (field) => typeof customer[field] !== "string" || !customer[field].trim()
  ) || !Array.isArray(items) || !items.length || items.length > 100 ||
      items.some((item) => !Number.isInteger(Number(item.productId)) ||
        !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1)) {
    return res.status(400).json({ message: "Valid delivery details and at least one product are required." });
  }

  const quantities = new Map();
  for (const item of items) {
    const productId = Number(item.productId);
    quantities.set(productId, (quantities.get(productId) || 0) + Number(item.quantity));
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ids = [...quantities.keys()];
    const productResult = await client.query(
      `SELECT id, name, price, delivery_price, stock FROM products
       WHERE id = ANY($1::int[]) AND active = TRUE FOR UPDATE`,
      [ids]
    );
    if (productResult.rowCount !== ids.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "One or more products are unavailable." });
    }

    const products = new Map(productResult.rows.map((product) => [product.id, product]));
    for (const [productId, quantity] of quantities) {
      if (quantity > products.get(productId).stock) {
        await client.query("ROLLBACK");
        return res.status(409).json({ message: `Not enough stock for ${products.get(productId).name}.` });
      }
    }

    const subtotal = [...quantities].reduce(
      (sum, [productId, quantity]) => sum + Number(products.get(productId).price) * quantity,
      0
    );
    const deliveryFee = [...quantities].reduce(
      (sum, [productId, quantity]) =>
        sum + Number(products.get(productId).delivery_price) * quantity,
      0
    );
    const orderResult = await client.query(
      `INSERT INTO orders
       (user_id, full_name, email, phone, address, city, state, delivery_note,
        subtotal, delivery_fee, total, payment_status, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'unpaid', 'pending')
       RETURNING id, full_name, email, phone, address, city, state, delivery_note,
                 subtotal, delivery_fee, total, payment_status, status, created_at`,
      [
        req.user.id,
        customer.fullName.trim(),
        customer.email.trim().toLowerCase(),
        customer.phone.trim(),
        customer.address.trim(),
        customer.city.trim(),
        customer.state.trim(),
        typeof customer.deliveryNote === "string" ? customer.deliveryNote.trim() : "",
        subtotal,
        deliveryFee,
        subtotal + deliveryFee,
      ]
    );
    const order = orderResult.rows[0];

    for (const [productId, quantity] of quantities) {
      const product = products.get(productId);
      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, product_name, unit_price, delivery_price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, productId, product.name, product.price, product.delivery_price, quantity]
      );
      await client.query(
        "UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2",
        [quantity, productId]
      );
    }
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);
    await client.query("COMMIT");

    const orderItems = [...quantities].map(([productId, quantity]) => ({
      productId,
      name: products.get(productId).name,
      price: Number(products.get(productId).price),
      delivery_price: Number(products.get(productId).delivery_price),
      quantity,
    }));
    return res.status(201).json({
      order: { ...order, id: `AM-${order.id}`, items: orderItems },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

router.get("/", async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const result = await pool.query(
    `SELECT o.id, o.user_id, o.full_name, o.email, o.phone, o.address, o.city, o.state,
            o.delivery_note, o.subtotal, o.delivery_fee, o.total, o.payment_status,
            o.status, o.created_at,
            COALESCE(json_agg(json_build_object(
              'productId', oi.product_id,
              'name', oi.product_name,
              'price', oi.unit_price,
              'delivery_price', oi.delivery_price,
              'quantity', oi.quantity
            )) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     ${isAdmin ? "" : "WHERE o.user_id = $1"}
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    isAdmin ? [] : [req.user.id]
  );
  return res.json({
    orders: result.rows.map((order) => ({
      ...order,
      id: `AM-${order.id}`,
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        delivery_price: Number(item.delivery_price),
      })),
    })),
  });
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid order status." });
  }
  const id = String(req.params.id).replace(/^AM-/, "");
  const result = await pool.query(
    "UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status, payment_status",
    [req.body.status, id]
  );
  if (!result.rowCount) return res.status(404).json({ message: "Order not found." });
  return res.json({ order: { ...result.rows[0], id: `AM-${result.rows[0].id}` } });
});

module.exports = router;
