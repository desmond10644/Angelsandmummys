
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import "./Payment.css";

function Payment() {
  const navigate = useNavigate();

  const checkoutData = JSON.parse(
    sessionStorage.getItem("checkoutData") || "null"
  );

  const [method, setMethod] = useState("bank-transfer");

  const handlePayment = (e) => {
    e.preventDefault();

    if (!checkoutData) {
      alert("Please complete checkout first.");
      navigate("/checkout");
      return;
    }

    // Demo only: this does not charge a customer.
    const order = {
      id: `AM-${Date.now()}`,
      ...checkoutData,
      paymentMethod: method,
      paymentStatus: "Pending",
      status: "Processing",
      createdAt: new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    localStorage.setItem("orders", JSON.stringify([order, ...orders]));

    sessionStorage.setItem("latestOrder", JSON.stringify(order));
    localStorage.removeItem("cart");
    sessionStorage.removeItem("checkoutData");

    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/order-success");
  };

  if (!checkoutData) {
    return (
      <section className="am-payment-page">
        <h2>No checkout information found.</h2>
        <Button onClick={() => navigate("/checkout")}>
          Return to Checkout
        </Button>
      </section>
    );
  }

  return (
    <section className="am-payment-page">
      <div className="am-payment-container">
        <h1>Payment</h1>
        <p>Choose your preferred payment method.</p>

        <div className="am-payment-total">
          <span>Amount to pay</span>
          <strong>
            ₦{Number(checkoutData.total).toLocaleString("en-NG")}
          </strong>
        </div>

        <form onSubmit={handlePayment}>
          <label className="am-payment-option">
            <input
              type="radio"
              name="payment"
              value="bank-transfer"
              checked={method === "bank-transfer"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span>
              <strong>Bank Transfer</strong>
              <small>Pay by bank transfer.</small>
            </span>
          </label>

          <label className="am-payment-option">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={method === "card"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span>
              <strong>Card Payment</strong>
              <small>Continue with a secure card payment provider.</small>
            </span>
          </label>

          <label className="am-payment-option">
            <input
              type="radio"
              name="payment"
              value="pay-on-delivery"
              checked={method === "pay-on-delivery"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span>
              <strong>Pay on Delivery</strong>
              <small>Pay when your order arrives, if available.</small>
            </span>
          </label>

          <Button type="submit" block>
            Confirm Demo Order
          </Button>
        </form>

        <p className="am-payment-warning">
          Demonstration only: no real payment is collected. Connect a payment
          provider and verify its server-side payment confirmation before
          accepting live orders.
        </p>
      </div>
    </section>
  );
}

export default Payment;
