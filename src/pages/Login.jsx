import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the server. Please try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="am-auth-page am-login-page">
      <div className="am-auth-card">
        <aside className="am-auth-welcome">
          <Link className="am-auth-logo" to="/" aria-label="Angels and Mummies home">
            <img src="/logo.jpg" alt="Angels & Mummy's" />
          </Link>
          <span className="am-auth-eyebrow">MOTHERHOOD, MADE MORE BEAUTIFUL</span>
          <h2>A little love for every little moment.</h2>
          <p>
            Thoughtful finds for mums, little ones, and all the beautiful
            moments in between.
          </p>
          <div className="am-auth-note">
            <ShieldCheck size={19} aria-hidden="true" />
            <span>A lovely, secure place to shop and keep everything together.</span>
          </div>
          <span className="am-auth-orb am-auth-orb-one" aria-hidden="true" />
          <span className="am-auth-orb am-auth-orb-two" aria-hidden="true" />
        </aside>

        <div className="am-auth-content">
          <div className="am-auth-heading">
            <span className="am-auth-eyebrow">WELCOME BACK</span>
            <h1>Sign in to your account</h1>
            <p>Pick up right where you left off.</p>
          </div>

          <form className="am-auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="am-auth-error" role="alert">
                {error}
              </div>
            )}

            <div className="am-auth-field">
              <label htmlFor="login-email">Email address</label>
              <div className="am-auth-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="am-auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="am-auth-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  className="am-auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="am-auth-submit" type="submit" disabled={loading}>
              <span>{loading ? "Signing you in..." : "Sign in"}</span>
              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>

          <p className="am-auth-switch">
            New to Angels & Mummies? <Link to="/register">Create an account</Link>
          </p>
          <Link className="am-auth-home-link" to="/">Continue browsing <ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}

export default Login;
