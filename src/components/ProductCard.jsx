
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import Rating from "./Rating";
import Notification from "./Notification";
import { useStore } from "../context/useStore";
import "./ProductCard.css";

function ProductCard({ product, onAddToCart, onWishlist }) {
  const [added, setAdded] = useState(false);
  const [actionError, setActionError] = useState("");
  const { addToCart, toggleWishlist } = useStore();

  if (!product) return null;

  const {
    id,
    name,
    price,
    image,
    image_url,
    category,
    rating,
    reviews,
    badge,
    description
  } = product;

  const productImage = image || image_url || "/placeholder.png";

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN"
    }).format(Number(amount) || 0);

  const handleAddToCart = async () => {
    try {
      await (onAddToCart ? onAddToCart(product) : addToCart(product));
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleWishlist = async () => {
    try {
      await (onWishlist ? onWishlist(product) : toggleWishlist(product));
    } catch (error) {
      setActionError(error.message);
    }
  };

  return (
    <article className="am-product-card">
      <div className="am-product-image">
        <Link to={`/products/${id}`}>
          <img src={productImage} alt={name} />
        </Link>

        {badge && <span className="am-product-badge">{badge}</span>}

        <button
          className="am-wishlist-button"
          aria-label="Add to wishlist"
          onClick={handleWishlist}
        >
          <Heart size={19} />
        </button>
      </div>

      <div className="am-product-info">
        {category && <span className="am-product-category">{category}</span>}

        <Link to={`/products/${id}`} className="am-product-name">
          {name}
        </Link>

        {description && (
          <p className="am-product-description">{description}</p>
        )}

        {rating !== undefined && (
          <Rating rating={Number(rating)} reviews={reviews} />
        )}

        <div className="am-product-bottom">
          <strong>{formatPrice(price)}</strong>

          <button
            className="am-add-cart"
            onClick={handleAddToCart}
            aria-label={`Add ${name} to cart`}
          >
            <ShoppingCart size={17} />
            {added ? "Added" : "Add"}
          </button>
        </div>
      </div>
      {actionError && (
        <Notification
          message={actionError}
          type="error"
          onClose={() => setActionError("")}
        />
      )}
    </article>
  );
}

export default ProductCard;
