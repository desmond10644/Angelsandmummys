
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ShoppingCart, User, Search } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="am-navbar">
      <div className="am-navbar-container">
        <Link to="/" className="am-logo" onClick={closeMenu}>
          Angels <span>&</span> Mummies
        </Link>

        <nav className={`am-nav-links ${menuOpen ? "active" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/shop" onClick={closeMenu}>Shop</NavLink>
          <NavLink to="/categories" onClick={closeMenu}>Categories</NavLink>
          <NavLink to="/about" onClick={closeMenu}>About</NavLink>
          <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
        </nav>

        <div className="am-navbar-actions">
          <Link to="/shop" className="am-nav-icon" aria-label="Search products">
            <Search size={21} />
          </Link>

          <Link to="/cart" className="am-nav-icon cart-icon" aria-label="Shopping cart">
            <ShoppingCart size={21} />
            {cartCount > 0 && (
              <span className="am-cart-count">{cartCount}</span>
            )}
          </Link>

          <Link to="/profile" className="am-nav-icon" aria-label="My account">
            <User size={21} />
          </Link>

          <button
            className="am-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
