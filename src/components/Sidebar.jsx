
import { NavLink } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Heart,
  ShoppingCart,
  Package,
  User,
  Settings,
  X
} from "lucide-react";
import "./Sidebar.css";

function Sidebar({ isOpen = false, onClose = () => {} }) {
  const links = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Shop", path: "/shop", icon: ShoppingBag },
    { name: "Categories", path: "/categories", icon: Package },
    { name: "Wishlist", path: "/wishlist", icon: Heart },
    { name: "Cart", path: "/cart", icon: ShoppingCart },
    { name: "My Orders", path: "/orders", icon: Package },
    { name: "My Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  return (
    <>
      {isOpen && (
        <div className="am-sidebar-overlay" onClick={onClose}></div>
      )}

      <aside className={`am-sidebar ${isOpen ? "open" : ""}`}>
        <div className="am-sidebar-header">
          <h3>My Account</h3>
          <button onClick={onClose} aria-label="Close sidebar">
            <X size={22} />
          </button>
        </div>

        <nav className="am-sidebar-links">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                <Icon size={19} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
