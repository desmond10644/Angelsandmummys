
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/useStore";
import { useAuth } from "../context/useAuth";
import "./Wishlist.css";

function Wishlist() {
  const { wishlist, toggleWishlist, storeError, cartLoading } = useStore();
  const { token } = useAuth();

  return (
    <section className="am-wishlist-page">
      <h1>My Wishlist</h1>
      <p>Products you have saved for later.</p>
      {storeError && <p role="alert">{storeError}</p>}
      {cartLoading && <p role="status">Loading your saved wishlist...</p>}
      {!token && <p>Sign in to sync your wishlist across devices.</p>}

      {!cartLoading && wishlist.length === 0 ? (
        <div className="am-wishlist-empty">
          <h2>Your wishlist is empty.</h2>
          <p>Explore our products and save your favourites here.</p>
          <Link to="/shop">Explore Products</Link>
        </div>
      ) : !cartLoading && (
        <div className="am-wishlist-grid">
          {wishlist.map((product) => (
            <div className="am-wishlist-item" key={product.id}>
              <ProductCard product={product} />
              <button
                className="am-wishlist-remove"
                onClick={() => toggleWishlist(product).catch(() => {})}
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
