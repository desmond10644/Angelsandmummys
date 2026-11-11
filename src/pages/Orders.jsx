
import { useState } from "react";
import { Link } from "react-router-dom";
import OrderCard from "../components/OrderCard";
import "./Orders.css";

function Orders() {
  const [orders] = useState(() =>
    JSON.parse(localStorage.getItem("orders") || "[]")
  );

  return (
    <section className="am-orders-page">
      <h1>My Orders</h1>
      <p className="am-orders-intro">
        View and track your recent purchases.
      </p>

      {orders.length === 0 ? (
        <div className="am-orders-empty">
          <h2>You haven't placed any orders yet.</h2>
          <p>Your orders will appear here after checkout.</p>
          <Link to="/shop">Start Shopping</Link>
        </div>
      ) : (
        <div className="am-orders-list">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Orders;
