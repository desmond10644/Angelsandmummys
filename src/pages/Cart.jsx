
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import Button from "../components/Button";
import { useStore } from "../context/useStore";
import { useAuth } from "../context/useAuth";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const { cart, cartLoading, storeError, updateCartQuantity, removeFromCart } = useStore();
  const { token } = useAuth();

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const formatPrice = (price) =>
    `₦${Number(price).toLocaleString("en-NG")}`;

  const changeQuantity = (id, quantity) => updateCartQuantity(id, quantity).catch(() => {});
  const removeItem = (id) => removeFromCart(id).catch(() => {});

  if (cartLoading) {
    return <section className="am-cart-page"><p role="status">Loading your saved cart...</p></section>;
  }

  if (cart.length === 0) {
    return (
      <section className="am-cart-page">
        <div className="am-cart-empty">
          {storeError && <p role="alert">{storeError}</p>}
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
      {storeError && <p role="alert">{storeError}</p>}
      {!token && <p>Your cart is saved on this device. Sign in to sync it across devices.</p>}

      <div className="am-cart-layout">
        <div className="am-cart-items">
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={changeQuantity}
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
            onClick={() => navigate(token ? "/checkout" : "/login?next=%2Fcheckout")}
          >
            {token ? "Proceed to Checkout" : "Sign in to Checkout"}
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
