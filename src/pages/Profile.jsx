import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CreditCard,
  LogOut,
  PackageCheck,
  ShoppingBag,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useStore } from "../context/useStore";
import { getAccountProfile } from "../services/accountService";
import { getOrders } from "../services/orderService";
import "./Profile.css";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
}

function Profile() {
  const navigate = useNavigate();
  const { user: sessionUser, token, signOut } = useAuth();
  const { cart, cartLoading } = useStore();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let active = true;
    Promise.all([getAccountProfile(), getOrders()])
      .then(([account, orderHistory]) => {
        if (!active) return;
        setProfile(account);
        setOrders(orderHistory);
        setError("");
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
        if (requestError.status === 401) signOut();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, signOut]);

  const handleSignOut = () => {
    signOut();
    navigate("/", { replace: true });
  };

  if (!token) {
    return (
      <main className="am-profile-page">
        <section className="am-profile-guest">
          <div className="am-profile-avatar"><UserRound size={25} /></div>
          <p className="am-profile-eyebrow">YOUR ACCOUNT</p>
          <h1>Welcome to your profile</h1>
          <p>Sign in to see your account, cart, order history and payment status.</p>
          <Link className="am-profile-primary" to="/login?next=%2Fprofile">
            Sign in <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    );
  }

  const displayName = profile?.full_name || sessionUser?.fullName || "there";
  const email = profile?.email || sessionUser?.email || "";
  const pendingPayments = orders.filter(
    (order) => (order.payment_status || "unpaid").toLowerCase() === "unpaid"
  ).length;
  const cartCount = cart.reduce(
    (count, item) => count + Number(item.quantity || 0),
    0
  );
  const recentOrders = orders.slice(0, 4);

  return (
    <main className="am-profile-page">
      <div className="am-profile-layout">
        <header className="am-profile-header">
          <div className="am-profile-welcome">
            <div className="am-profile-avatar"><UserRound size={25} /></div>
            <div>
              <p className="am-profile-eyebrow">MY ACCOUNT</p>
              <h1>Hello, {displayName}</h1>
              <p>{email}</p>
            </div>
          </div>
          <button className="am-profile-logout" type="button" onClick={handleSignOut}>
            <LogOut size={17} /> Log out
          </button>
        </header>

        {error && <div className="am-profile-error" role="alert">{error}</div>}

        {loading ? (
          <div className="am-profile-loading" role="status">Loading your account...</div>
        ) : (
          <>
            <section className="am-profile-stats" aria-label="Account overview">
              <Link className="am-profile-stat" to="/orders">
                <span className="am-profile-stat-icon"><PackageCheck size={20} /></span>
                <span><strong>{orders.length}</strong><small>Orders</small></span>
                <ArrowRight size={16} />
              </Link>
              <Link className="am-profile-stat" to="/cart">
                <span className="am-profile-stat-icon"><ShoppingCart size={20} /></span>
                <span><strong>{cartLoading ? "…" : cartCount}</strong><small>Items in cart</small></span>
                <ArrowRight size={16} />
              </Link>
              <a className="am-profile-stat" href="#payment-history">
                <span className="am-profile-stat-icon"><CreditCard size={20} /></span>
                <span><strong>{pendingPayments}</strong><small>Unpaid orders</small></span>
                <ArrowRight size={16} />
              </a>
            </section>

            <section className="am-profile-account-card">
              <div>
                <p className="am-profile-eyebrow">ACCOUNT DETAILS</p>
                <h2>{profile?.full_name || displayName}</h2>
                <p>{email}</p>
                {profile?.phone && <p>{profile.phone}</p>}
              </div>
              <span className="am-profile-member">
                {profile?.role === "admin" ? "Administrator account" : "Customer account"}
              </span>
            </section>

            <div className="am-profile-columns">
              <section className="am-profile-panel">
                <div className="am-profile-panel-heading">
                  <div>
                    <p className="am-profile-eyebrow">PURCHASES</p>
                    <h2>Order history</h2>
                  </div>
                  <Link to="/orders">View all</Link>
                </div>

                {recentOrders.length ? (
                  <div className="am-profile-order-list">
                    {recentOrders.map((order) => (
                      <article className="am-profile-order" key={order.id}>
                        <div className="am-profile-order-icon"><ShoppingBag size={18} /></div>
                        <div className="am-profile-order-info">
                          <strong>Order {order.id}</strong>
                          <span>{formatDate(order.created_at)} · {order.items?.length || 0} items</span>
                        </div>
                        <div className="am-profile-order-state">
                          <strong>{currency.format(Number(order.total || 0))}</strong>
                          <span>{order.status || "pending"} · payment {order.payment_status || "unpaid"}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="am-profile-empty">
                    <p>Your order history will appear here after checkout.</p>
                    <Link to="/shop">Browse the shop</Link>
                  </div>
                )}
              </section>

              <section className="am-profile-panel am-profile-payment-panel" id="payment-history">
                <div className="am-profile-panel-heading">
                  <div>
                    <p className="am-profile-eyebrow">CHECKOUT &amp; PAYMENTS</p>
                    <h2>Payment status</h2>
                  </div>
                  <CreditCard size={19} aria-hidden="true" />
                </div>
                <p className="am-profile-payment-note">
                  Checkout and orders are connected to your account. Online payment
                  processing is not connected yet, so orders are recorded as unpaid.
                </p>
                {pendingPayments > 0 && (
                  <p className="am-profile-payment-count">
                    {pendingPayments} order{pendingPayments === 1 ? "" : "s"} awaiting payment.
                  </p>
                )}
                <Link
                  className={`am-profile-primary ${cartCount === 0 ? "is-muted" : ""}`}
                  to={cartCount > 0 ? "/checkout" : "/cart"}
                >
                  {cartCount > 0 ? "Continue to checkout" : "View shopping cart"}
                  <ArrowRight size={17} />
                </Link>
              </section>
            </div>

            <div className="am-profile-shortcuts">
              <Link to="/cart"><ShoppingCart size={17} /> Shopping cart</Link>
              <Link to="/checkout"><ShoppingBag size={17} /> Checkout</Link>
              <Link to="/orders"><PackageCheck size={17} /> Order history</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Profile;
