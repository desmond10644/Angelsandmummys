
import { Link } from "react-router-dom";
import { localImages } from "../data/localImages";
import "./About.css";

function About() {
  return (
    <section className="am-about-page">
      <div className="am-about-hero">
        <div className="am-about-hero-content">
          <span>WELCOME TO ANGELS & MUMMIES</span>
          <h1>Making Motherhood and Childhood Beautiful</h1>
          <p>
            We provide carefully selected products for mothers, babies,
            and children to make everyday life easier, happier, and more
            comfortable.
          </p>
          <Link to="/shop" className="am-about-button">
            Explore Our Products
          </Link>
        </div>
      </div>

      <div className="am-about-story">
        <div className="am-about-image">
          <img
            src={localImages.familyShopping}
            alt="A customer shopping for children's products"
          />
        </div>

        <div className="am-about-story-content">
          <span>OUR STORY</span>
          <h2>Every Mother and Child Deserves the Best</h2>
          <p>
            Angels & Mummies was created with a simple purpose: to make
            shopping for mothers, babies, and children convenient and
            enjoyable.
          </p>
          <p>
            From maternity essentials to baby care products and children's
            items, we aim to bring useful products together in one place.
          </p>
        </div>
      </div>

      <div className="am-about-values">
        <h2>What Makes Us Special?</h2>

        <div className="am-about-values-grid">
          <div className="am-about-value-card">
            <span>♡</span>
            <h3>Quality Products</h3>
            <p>
              We aim to offer useful, carefully selected products for
              mothers and children.
            </p>
          </div>

          <div className="am-about-value-card">
            <span>✦</span>
            <h3>Customer Care</h3>
            <p>
              We want every customer to enjoy a helpful and pleasant
              shopping experience.
            </p>
          </div>

          <div className="am-about-value-card">
            <span>✓</span>
            <h3>Convenient Shopping</h3>
            <p>
              Find maternity, baby, and kids' essentials all in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="am-about-cta">
        <h2>Find Something Special Today</h2>
        <p>Discover products for every stage of motherhood and childhood.</p>
        <Link to="/shop">Start Shopping</Link>
      </div>
    </section>
  );
}

export default About;
