
import { Link } from "react-router-dom";
import "./CategoryCard.css";

function CategoryCard({ category }) {
  if (!category) return null;

  const {
    name,
    image,
    image_url,
    description,
    product_count
  } = category;

  return (
    <Link
      to={`/shop?category=${encodeURIComponent(name || "")}`}
      className="am-category-card"
    >
      <div className="am-category-image">
        <img
          src={image || image_url || "/placeholder.png"}
          alt={name}
        />
      </div>

      <div className="am-category-info">
        <h3>{name}</h3>

        {description && <p>{description}</p>}

        {product_count !== undefined && (
          <span>{product_count} Products</span>
        )}
      </div>
    </Link>
  );
}

export default CategoryCard;
