
import { Link } from "react-router-dom";
import { products } from "../data/products";
import { categories } from "../data/categories";
import { localImages } from "../data/localImages";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import "./Home.css";

function Home() {
  const featuredProducts = products.slice(0, 8);
  const popularCategories = categories.slice(0, 4);

  return (
    <main className="am-home">
      <section className="am-home-hero">
        <div className="am-home-hero-content">
          <span>WELCOME TO ANGELS & MUMMIES</span>
          <h1>Everything you need for motherhood and little ones.</h1>
          <p>
            Discover quality products and everyday essentials
            for mothers, babies and growing children.
          </p>

          <div className="am-home-hero-buttons">
            <Link to="/shop" className="am-home-primary">
              Shop Now
            </Link>
            <Link to="/categories" className="am-home-secondary">
              Explore Categories
            </Link>
          </div>
        </div>

        <div className="am-home-hero-image">
          <img src={localImages.storefront} alt="Angels & Mummy's storefront" />
        </div>
      </section>

      <section className="am-home-section">
        <div className="am-home-heading">
          <div>
            <span>EXPLORE OUR STORE</span>
            <h2>Shop by Category</h2>
          </div>
          <Link to="/categories">View All</Link>
        </div>

        <div className="am-home-category-grid">
          {popularCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {popularCategories.length === 0 && (
          <p>No categories are available yet.</p>
        )}
      </section>

      <section className="am-home-promo">
        <div>
          <span>MADE FOR EVERY STAGE</span>
          <h2>Care for Mum. Comfort for Baby.</h2>
          <p>Find useful essentials for every stage of family life.</p>
        </div>
        <Link to="/shop">Browse Products</Link>
      </section>

      <section className="am-home-section">
        <div className="am-home-heading">
          <div>
            <span>OUR COLLECTION</span>
            <h2>Featured Products</h2>
          </div>
          <Link to="/shop">Shop All</Link>
        </div>

        <div className="am-home-product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {featuredProducts.length === 0 && (
          <p>No products have been added yet.</p>
        )}
      </section>
    </main>
  );
}

export default Home;
