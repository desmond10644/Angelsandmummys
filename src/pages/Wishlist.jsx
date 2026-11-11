
import { useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "./Wishlist.css";

function Wishlist() {
  const [wishlist, setWishlist] = useState(() =>
    JSON.parse(localStorage.getItem("wishlist") || "[]")
  );

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((product) => product.id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  return (
    <section className="am-wishlist-page">
      <h1>My Wishlist</h1>
      <p>Products you have saved for later.</p>

      {wishlist.length === 0 ? (
        <div className="am-wishlist-empty">
          <h2>Your wishlist is empty.</h2>
          <p>Explore our products and save your favourites here.</p>
          <Link to="/shop">Explore Products</Link>
        </div>
      ) : (
        <div className="am-wishlist-grid">
          {wishlist.map((product) => (
            <div className="am-wishlist-item" key={product.id}>
              <ProductCard product={product} />
              <button
                className="am-wishlist-remove"
                onClick={() => removeFromWishlist(product.id)}
              >
                Remove from Wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Wishlist;
