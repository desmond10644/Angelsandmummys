import { apiRequest } from "./api";

export async function createOrder({ customer, items }) {
  const data = await apiRequest("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      customer,
      items: items.map((item) => ({
        productId: Number(item.id ?? item.productId),
        quantity: Number(item.quantity),
      })),
    }),
  });
  return data.order;
}

export async function getOrders() {
  const data = await apiRequest("/api/orders");
  return data.orders;
}