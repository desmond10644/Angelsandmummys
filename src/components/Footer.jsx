
import { Link } from "react-router-dom";
import {
  Globe,
  MessageCircle,
  Send,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="am-footer">
      <div className="am-footer-container">

        <div className="am-footer-column am-footer-about">
          <h2>Angels <span>&</span> Mummies</h2>
          <p>
            Discover quality products for mothers, babies and families.
            We make shopping simple, convenient and enjoyable.
          </p>

          <div className="am-social-links">
            <a href="https://facebook.com" aria-label="Facebook">
              <Globe size={19} />
            </a>
            <a href="https://instagram.com" aria-label="Instagram">
              <MessageCircle size={19} />
            </a>
            <a href="https://twitter.com" aria-label="Twitter">
              <Send size={19} />
            </a>
          </div>
        </div>

        <div className="am-footer-column">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="am-footer-column">
          <h3>Customer Service</h3>
          <Link to="/profile">My Account</Link>
          <Link to="/cart">Shopping Cart</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/contact">Help & Support</Link>
        </div>

        <div className="am-footer-column am-contact-column">
          <h3>Contact Information</h3>
          <p><Mail size={17} /> hello@angelsandmummies.com</p>
          <p><Phone size={17} /> Add your business phone number</p>
          <p><MapPin size={17} /> Nigeria</p>
        </div>

      </div>

      <div className="am-footer-bottom">
        <p>
          © {new Date().getFullYear()} Angels & Mummies.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
