import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slideImage1 from "../../images/image1.jpeg";
import slideImage2 from "../../images/image2.jpeg";
import slideImage3 from "../../images/image3.jpeg";
import slideImage4 from "../../images/image4.jpeg";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import CatalogStatus from "../components/CatalogStatus";
import { useStore } from "../context/useStore";
import { getCatalogCategories } from "../utils/catalog";
import {
  getPublicHeroSlides,
  resolveSlideImage,
} from "../services/heroSlideService";
import "./Home.css";

const fallbackSlides = [
  {
    id: "store",
    imageUrl: slideImage1,
    eyebrow: "WELCOME TO ANGELS & MUMMIES",
    heading: "Everything you need for motherhood and little ones.",
    description:
      "Discover quality products and everyday essentials for mothers, babies and growing children.",
    primaryButtonText: "Shop Now",
    primaryButtonUrl: "/shop",
    secondaryButtonText: "Explore Categories",
    secondaryButtonUrl: "/categories",
  },
  {
    id: "family",
    imageUrl: slideImage2,
    eyebrow: "LITTLE MOMENTS, BIG LOVE",
    heading: "Beautiful finds for every stage of family life.",
    description:
      "Explore thoughtful picks for mum, baby and every growing little personality.",
    primaryButtonText: "Shop Now",
    primaryButtonUrl: "/shop",
    secondaryButtonText: "Explore Categories",
    secondaryButtonUrl: "/categories",
  },
  {
    id: "baby",
    imageUrl: slideImage3,
    eyebrow: "MADE FOR YOUR LITTLE ONE",
    heading: "A softer start for life's sweetest adventures.",
    description:
      "Find practical baby essentials and joyful discoveries for your family's next chapter.",
    primaryButtonText: "Shop Baby Care",
    primaryButtonUrl: "/baby-products",
    secondaryButtonText: "Explore Categories",
    secondaryButtonUrl: "/categories",
  },
  {
    id: "four",
    imageUrl: slideImage4,
    eyebrow: "PLAY, LEARN & GROW",
    heading: "Little adventures start with the right essentials.",
    description:
      "Shop thoughtful picks for happy playtimes and memorable family moments.",
    primaryButtonText: "Shop Now",
    primaryButtonUrl: "/shop",
    secondaryButtonText: "Explore Categories",
    secondaryButtonUrl: "/categories",
  },
];

function Home() {
  const { products, catalogLoading, catalogError, refreshProducts } = useStore();
  const [slides, setSlides] = useState(fallbackSlides);
  const [activeSlide, setActiveSlide] = useState(0);
  const featuredProducts = products.slice(0, 8);
  const popularCategories = getCatalogCategories(products).slice(0, 4);
  const slide = slides[activeSlide] || fallbackSlides[0];

  useEffect(() => {
    let active = true;
    getPublicHeroSlides()
      .then((managedSlides) => {
        if (!active || managedSlides.length === 0) return;
        setSlides(managedSlides);
        setActiveSlide(0);
      })
      .catch((error) => {
        console.warn(
          "Using local hero slides because the slider API is unavailable:",
          error
        );
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const showSlide = (index) => {
    setActiveSlide((index + slides.length) % slides.length);
  };

  return (
    <main className="am-home">
      <section
        className="am-home-hero"
        aria-roledescription="carousel"
        aria-label="Angels & Mummies featured collection"
      >
        <div className="am-home-hero-image">
          <img
            key={slide.id}
            src={resolveSlideImage(slide.imageUrl)}
            alt=""
            aria-hidden="true"
          />
        </div>
        <div className="am-home-hero-shade" />

        <div className="am-home-hero-content" key={`content-${slide.id}`}>
          <span>{slide.eyebrow || "ANGELS & MUMMIES"}</span>
          <h1>{slide.heading}</h1>
          <p>{slide.description}</p>
          <div className="am-home-hero-buttons">
            <Link
              to={slide.primaryButtonUrl || "/shop"}
              className="am-home-primary"
            >
              {slide.primaryButtonText || "Shop Now"}
            </Link>
            <Link
              to={slide.secondaryButtonUrl || "/categories"}
              className="am-home-secondary"
            >
              {slide.secondaryButtonText || "Explore Categories"}
            </Link>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <div className="am-home-slider-controls">
              <button
                type="button"
                onClick={() => showSlide(activeSlide - 1)}
                aria-label="Previous slide"
              >
                <ChevronLeft size={22} />
              </button>
              <div className="am-home-slider-dots">
                {slides.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={index === activeSlide ? "active" : ""}
                    onClick={() => showSlide(index)}
                    aria-label={`Show slide ${index + 1}`}
                    aria-current={index === activeSlide ? "true" : undefined}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => showSlide(activeSlide + 1)}
                aria-label="Next slide"
              >
                <ChevronRight size={22} />
              </button>
            </div>
            <span className="am-home-slide-count" aria-live="polite">
              {String(activeSlide + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </span>
          </>
        )}
      </section>

      <section className="am-home-section">
        <div className="am-home-heading">
          <div>
            <span>EXPLORE OUR STORE</span>
            <h2>Shop by Category</h2>
          </div>
          <Link to="/categories">View All</Link>
        </div>

        <CatalogStatus loading={catalogLoading} error={catalogError} onRetry={refreshProducts} />
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

        <CatalogStatus loading={catalogLoading} error={catalogError} onRetry={refreshProducts} />
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
