
import { useState } from "react";
import "./Settings.css";

function Settings() {
  const [settings, setSettings] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("accountSettings") || "null");
    return saved || {
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    };
  });

  const handleToggle = (e) => {
    const updated = {
      ...settings,
      [e.target.name]: e.target.checked,
    };

    setSettings(updated);
    localStorage.setItem("accountSettings", JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <section className="am-settings-page">
      <div className="am-settings-container">
        <h1>Account Settings</h1>
        <p>Manage your preferences and account.</p>

        <div className="am-settings-section">
          <h2>Notifications</h2>

          <label className="am-settings-option">
            <span>
              <strong>Email Notifications</strong>
              <small>Receive updates and offers by email.</small>
            </span>
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleToggle}
            />
          </label>

          <label className="am-settings-option">
            <span>
              <strong>SMS Notifications</strong>
              <small>Receive order updates by text message.</small>
            </span>
            <input
              type="checkbox"
              name="smsNotifications"
              checked={settings.smsNotifications}
              onChange={handleToggle}
            />
          </label>
        </div>

        <div className="am-settings-section">
          <h2>Appearance</h2>

          <label className="am-settings-option">
            <span>
              <strong>Dark Mode Preference</strong>
              <small>Save your preference for a dark appearance.</small>
            </span>
            <input
              type="checkbox"
              name="darkMode"
              checked={settings.darkMode}
              onChange={handleToggle}
            />
          </label>
        </div>

        <div className="am-settings-section">
          <h2>Account</h2>
          <button
            className="am-settings-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}

export default Settings;
