
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      fullName: user.fullName || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    };
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

    localStorage.setItem(
      "user",
      JSON.stringify({ ...existingUser, ...profile })
    );

    setMessage("Profile updated in this browser.");
  };

  return (
    <section className="am-profile-page">
      <div className="am-profile-container">
        <h1>My Profile</h1>
        <p>Manage your personal information.</p>

        {message && <div className="am-profile-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            required
          />

          <label>Phone Number</label>
          <input
            name="phone"
            value={profile.phone}
            onChange={handleChange}
          />

          <button type="submit">Save Changes</button>
        </form>

        <div className="am-profile-links">
          <Link to="/orders">My Orders</Link>
          <Link to="/wishlist">My Wishlist</Link>
          <Link to="/settings">Account Settings</Link>
        </div>
      </div>
    </section>
  );
}

export default Profile;
