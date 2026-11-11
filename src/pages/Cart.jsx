
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import Button from "../components/Button";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );

  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;

    saveCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id) => {
    saveCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const formatPrice = (price) =>
    `₦${Number(price).toLocaleString("en-NG")}`;

  if (cart.length === 0) {
    return (
      <section className="am-cart-page">
        <div className="am-cart-empty">
          <h1>Your Cart Is Empty</h1>
          <p>You haven't added any products to your cart yet.</p>
          <Link to="/shop" className="am-cart-shop-link">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="am-cart-page">
      <h1>Shopping Cart</h1>

      <div className="am-cart-layout">
        <div className="am-cart-items">
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <aside className="am-cart-summary">
          <h2>Order Summary</h2>

          <div className="am-cart-summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="am-cart-summary-row">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="am-cart-total">
            <span>Total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <Button
            block
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </Button>

          <Link to="/shop" className="am-cart-continue">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default Cart;
