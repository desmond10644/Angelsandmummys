import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/useAuth";
import { useStore } from "../context/useStore";
import { createOrder } from "../services/orderService";
import "./Payment.css";

function Payment() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { cart, cartLoading, clearCart, refreshProducts } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const checkoutData = JSON.parse(
    sessionStorage.getItem("checkoutData") || "null"
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      navigate("/login?next=%2Fpayment");
      return;
    }
    if (!checkoutData || !cart.length) {
      navigate("/checkout");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const order = await createOrder({
        customer: checkoutData.customer,
        items: cart,
      });
      sessionStorage.setItem("latestOrder", JSON.stringify(order));
      sessionStorage.removeItem("checkoutData");
      clearCart();
      refreshProducts();
      navigate("/order-success", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutData) {
    return (
      <section className="am-payment-page">
        <h2>No checkout information found.</h2>
        <Button onClick={() => navigate("/checkout")}>Return to Checkout</Button>
      </section>
    );
  }

  if (cartLoading) {
    return <section className="am-payment-page"><p role="status">Loading your saved cart...</p></section>;
  }

  if (!token) {
    return (
      <section className="am-payment-page">
        <h2>Sign in to place your order.</h2>
        <Link to="/login?next=%2Fpayment">Sign in</Link>
      </section>
    );
  }

  const formatPrice = (amount) => `₦${Number(amount).toLocaleString("en-NG")}`;

  return (
    <section className="am-payment-page">
      <div className="am-payment-container">
        <h1>Review and Place Order</h1>
        <p>Your order will be saved to your account with payment marked unpaid.</p>

        <div className="am-payment-total">
          <span>Estimated total</span>
          <strong>{formatPrice(checkoutData.total)}</strong>
        </div>

        {error && <p role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          <p className="am-payment-warning">
            No payment provider is connected. Placing this order does not charge
            you; the server will confirm current prices and stock and record the
            order as unpaid.
          </p>
          <Button type="submit" block disabled={loading}>
            {loading ? "Placing order..." : "Place Unpaid Order"}
          </Button>
        </form>
      </div>
    </section>
  );
}

export default Payment;
