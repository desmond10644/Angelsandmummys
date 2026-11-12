
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrderCard from "../components/OrderCard";
import { useAuth } from "../context/useAuth";
import { getOrders } from "../services/orderService";
import "./Orders.css";

function Orders() {
  const { token, signOut } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    const loadOrders = async () => {
      try {
        const data = await getOrders();
        if (active) {
          setOrders(data);
          setError("");
        }
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message);
        if (requestError.status === 401) signOut();
      } finally {
        if (active) setLoading(false);
      }
    };
    loadOrders();
    const timer = window.setInterval(loadOrders, 30000);
    window.addEventListener("focus", loadOrders);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", loadOrders);
    };
  }, [token, signOut]);

  return (
    <section className="am-orders-page">
      <h1>My Orders</h1>
      <p className="am-orders-intro">
        View and track your recent purchases.
      </p>

      {!token && <p>Sign in to view orders placed with your account. <Link to="/login?next=%2Forders">Sign in</Link></p>}
      {error && <p role="alert">{error}</p>}
      {token && loading ? <p role="status">Loading your orders...</p> : token && orders.length === 0 ? (
        <div className="am-orders-empty">
          <h2>You haven't placed any orders yet.</h2>
          <p>Your orders will appear here after checkout.</p>
          <Link to="/shop">Start Shopping</Link>
        </div>
      ) : token && (
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
