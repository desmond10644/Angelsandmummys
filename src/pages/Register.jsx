import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useAuth } from "../context/useAuth";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const user = await signUp({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      const next = new URLSearchParams(window.location.search).get("next");
      const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "";
      navigate(user.role === "admin"
        ? (safeNext || "/admin")
        : (safeNext.startsWith("/admin") ? "/" : safeNext || "/"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="am-auth-page am-register-page">
      <div className="am-auth-card">
        <aside className="am-auth-welcome">
          <Link className="am-auth-logo" to="/" aria-label="Angels and Mummies home">
            <img src="/logo.jpg" alt="Angels & Mummy's" />
          </Link>
          <span className="am-auth-eyebrow">A LITTLE SOMETHING SPECIAL</span>
          <h2>Made for you and your growing family.</h2>
          <p>
            Join our community for thoughtful essentials and sweet discoveries
            for every stage.
          </p>
          <div className="am-auth-note">
            <UserRound size={19} aria-hidden="true" />
            <span>Create your account and find your new family favourites.</span>
          </div>
          <span className="am-auth-orb am-auth-orb-one" aria-hidden="true" />
          <span className="am-auth-orb am-auth-orb-two" aria-hidden="true" />
        </aside>

        <div className="am-auth-content">
          <div className="am-auth-heading">
            <span className="am-auth-eyebrow">JOIN OUR FAMILY</span>
            <h1>Create your account</h1>
            <p>It only takes a moment to get started.</p>
          </div>

          <form className="am-auth-form am-register-form" onSubmit={handleSubmit}>
            {error && (
              <div className="am-auth-error" role="alert">
                {error}
              </div>
            )}

            <div className="am-auth-field">
              <label htmlFor="register-name">Full name</label>
              <div className="am-auth-input-wrap">
                <UserRound size={18} aria-hidden="true" />
                <input
                  id="register-name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="am-auth-field">
              <label htmlFor="register-email">Email address</label>
              <div className="am-auth-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="register-email"
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
              <label htmlFor="register-phone">Phone number</label>
              <div className="am-auth-input-wrap">
                <Phone size={18} aria-hidden="true" />
                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            <div className="am-auth-field">
              <label htmlFor="register-password">Password</label>
              <div className="am-auth-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
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

            <div className="am-auth-field">
              <label htmlFor="register-confirm-password">Confirm password</label>
              <div className="am-auth-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  minLength={8}
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  required
                />
                <button
                  className="am-auth-password-toggle"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="am-auth-submit" type="submit" disabled={loading}>
              <span>{loading ? "Creating your account..." : "Create account"}</span>
              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>

          <p className="am-auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <Link className="am-auth-home-link" to="/">Continue browsing <ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}

export default Register;
