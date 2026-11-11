
import { useState } from "react";
import "./Contact.css";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Demo only: connect this form to your backend to store messages.
    setSuccess("Thank you! Your message has been received in this demo.");
    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <section className="am-contact-page">
      <div className="am-contact-header">
        <span>WE ARE HERE TO HELP</span>
        <h1>Contact Us</h1>
        <p>
          Have a question about our products or your order?
          Send us a message.
        </p>
      </div>

      <div className="am-contact-layout">
        <div className="am-contact-information">
          <h2>Get In Touch</h2>
          <p>
            We would love to hear from you. Reach out to us using
            the information below.
          </p>

          <div className="am-contact-info-item">
            <span>✉</span>
            <div>
              <h3>Email</h3>
              <p><a href="mailto:info@angelsandmummy.ng">info@angelsandmummy.ng</a></p>
            </div>
          </div>

          <div className="am-contact-info-item">
            <span>⌖</span>
            <div>
              <h3>Location</h3>
              <p>Emco Plaza, Okpanam Road, Asaba, Delta State.</p>
            </div>
          </div>
        </div>

        <form className="am-contact-form" onSubmit={handleSubmit}>
          <h2>Send Us a Message</h2>

          {success && (
            <div className="am-contact-success">{success}</div>
          )}

          <label>Your Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />

          <label>Subject</label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="What is your message about?"
            required
          />

          <label>Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Write your message here..."
            required
          />

          <button type="submit">Send Message</button>
        </form>
      </div>
    </section>
  );
}

export default Contact;
