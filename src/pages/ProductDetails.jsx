
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { products } from "../data/products";
import Rating from "../components/Rating";
import Button from "../components/Button";
import Notification from "../components/Notification";
import "./ProductsDetails.css";

function ProductDetails() {
  const { id } = useParams();

  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");

  if (!product) {
    return (
      <main className="am-product-not-found">
        <h2>Product not found</h2>
        <Link to="/shop">Return to Shop</Link>
      </main>
    );
  }

  const image = product.image || product.image_url || "/placeholder.png";

  const price = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN"
  }).format(Number(product.price) || 0);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(
      (item) => String(item.id) === String(product.id)
    );

    const updatedCart = existing
      ? cart.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                quantity: Number(item.quantity || 1) + quantity
              }
            : item
        )
      : [...cart, { ...product, quantity }];

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));

    setNotice("Product added to your cart.");
  };

  return (
    <main className="am-product-details-page">
      <div className="am-product-breadcrumb">
        <Link to="/">Home</Link> /
        <Link to="/shop"> Shop</Link> /
        <span> {product.name}</span>
      </div>

      <section className="am-product-details">
        <div className="am-product-details-image">
          <img src={image} alt={product.name} />
        </div>

        <div className="am-product-details-info">
          {product.category && (
            <span className="am-product-category">
              {product.category}
            </span>
          )}

          <h1>{product.name}</h1>

          {product.rating !== undefined && (
            <Rating
              rating={Number(product.rating)}
              reviews={product.reviews}
            />
          )}

          <strong className="am-product-price">
            {price}
          </strong>

          <p>
            {product.description ||
              "A thoughtfully selected product from Angels & Mummies."}
          </p>

          {product.stock !== undefined && (
            <p className="am-product-stock">
              {Number(product.stock) > 0
                ? "In Stock"
                : "Out of Stock"}
            </p>
          )}

          <div className="am-product-quantity">
            <button
              onClick={() =>
                setQuantity((current) => Math.max(1, current - 1))
              }
            >
              −
            </button>

            <span>{quantity}</span>

            <button
              onClick={() => setQuantity((current) => current + 1)}
            >
              +
            </button>
          </div>

          <Button
            onClick={addToCart}
            disabled={
              product.stock !== undefined &&
              Number(product.stock) <= 0
            }
          >
            Add to Cart
          </Button>

          {notice && (
            <Notification
              message={notice}
              type="success"
              onClose={() => setNotice("")}
            />
          )}
        </div>
      </section>
    </main>
  );
}

export default ProductDetails;
