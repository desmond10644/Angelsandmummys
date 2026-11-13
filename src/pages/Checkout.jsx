
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useStore } from "../context/useStore";
import { useAuth } from "../context/useAuth";
import "./checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { cart, cartLoading } = useStore();
  const { token, user } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    deliveryNote: "",
  });

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const deliveryFee = cart.reduce(
    (total, item) =>
      total + Number(item.delivery_price || 0) * Number(item.quantity || 1),
    0
  );
  const total = subtotal + deliveryFee;

  const formatPrice = (price) =>
    `₦${Number(price).toLocaleString("en-NG")}`;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/login?next=%2Fcheckout");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      navigate("/shop");
      return;
    }

    const checkoutData = {
      customer: form,
      items: cart,
      subtotal,
      deliveryFee,
      total,
    };

    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify(checkoutData)
    );

    navigate("/payment");
  };

  if (cartLoading) {
    return <section className="am-checkout-page"><p role="status">Loading your account cart...</p></section>;
  }

  if (!token) {
    return (
      <section className="am-checkout-page">
        <h1>Sign in to continue</h1>
        <p>Orders are saved to your customer account.</p>
        <Button onClick={() => navigate("/login?next=%2Fcheckout")}>Sign in</Button>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="am-checkout-page">
        <h2>Your cart is empty.</h2>
        <Button onClick={() => navigate("/shop")}>
          Shop Now
        </Button>
      </section>
    );
  }

  return (
    <section className="am-checkout-page">
      <h1>Checkout</h1>

      <form onSubmit={handleSubmit} className="am-checkout-layout">
        <div className="am-checkout-form">
          <h2>Delivery Information</h2>

          <label>Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="Enter your phone number"
          />

          <label>Delivery Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="House number, street and area"
          />

          <label>City</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />

          <label>State</label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            required
          />

          <label>Delivery Note (Optional)</label>
          <textarea
            name="deliveryNote"
            value={form.deliveryNote}
            onChange={handleChange}
            placeholder="Any additional delivery instructions"
          />

          <Button type="submit" block>
            Continue to Payment
          </Button>
        </div>

        <aside className="am-checkout-summary">
          <h2>Your Order</h2>

          {cart.map((item) => (
            <div className="am-checkout-item" key={item.id}>
              <span>
                {item.name} × {item.quantity || 1}
              </span>
              <strong>
                {formatPrice(
                  Number(item.price) * Number(item.quantity || 1)
                )}
              </strong>
            </div>
          ))}

          <div className="am-checkout-total-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="am-checkout-total-row">
            <span>Delivery</span>
            <strong>{formatPrice(deliveryFee)}</strong>
          </div>

          <div className="am-checkout-grand-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </aside>
      </form>
    </section>
  );
}

export default Checkout;
