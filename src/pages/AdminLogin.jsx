import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { adminRequest } from "../services/adminApi";
import "./Admin.css";

function AdminLogin({ embedded = false }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await adminRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.user?.role !== "admin") {
        throw new Error("This account does not have administrator access.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/admin", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`admin-login-page ${embedded ? "admin-login-embedded" : ""}`}>
      <section className="admin-login-panel">
        <a className="admin-wordmark" href="/">A&M <span>OPERATIONS</span></a>
        <p className="admin-eyebrow">STAFF ACCESS</p>
        <h1>Administrator sign in</h1>
        <p className="admin-login-copy">Manage the catalog, customer orders, and fulfilment.</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="admin-alert" role="alert">{error}</div>}
          <label htmlFor="admin-email">Email address</label>
          <div className="admin-input-wrap">
            <Mail size={18} aria-hidden="true" />
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <label htmlFor="admin-password">Password</label>
          <div className="admin-input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button className="admin-primary-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </form>
        <div className="admin-login-links">
          <Link className="admin-back-link" to="/login">Customer sign in</Link>
          <Link className="admin-back-link" to="/">Back to the store</Link>
        </div>
      </section>
      <aside className="admin-login-aside">
        <span>ANGELS & MUMMY'S</span>
        <p>Thoughtful care, handled with care.</p>
        <div className="admin-aside-rule" />
        <small>CATALOG · CUSTOMERS · FULFILMENT</small>
      </aside>
    </section>
  );
}

export default AdminLogin;