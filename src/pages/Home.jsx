
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";
import { products } from "../data/products";
import { categories } from "../data/categories";
import { localImages } from "../data/localImages";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import "./Home.css";

const defaultSlides = [
  { src: localImages.storefront, alt: "Angels & Mummy's storefront" },
];
const slidesStorageKey = "amHomeHeroSlides";
const maxSlides = 6;

function readSlides() {
  try {
    const savedSlides = localStorage.getItem(slidesStorageKey);
    if (!savedSlides) return { slides: defaultSlides, error: "" };

    const parsedSlides = JSON.parse(savedSlides);
    if (
      !Array.isArray(parsedSlides) ||
      parsedSlides.length === 0 ||
      parsedSlides.length > maxSlides ||
      parsedSlides.some(
        (slide) =>
          typeof slide?.src !== "string" ||
          (slide.src !== defaultSlides[0].src &&
            !slide.src.startsWith("data:image/")) ||
          typeof slide.alt !== "string"
      )
    ) {
      throw new Error("Saved slider images have an invalid format.");
    }

    return { slides: parsedSlides, error: "" };
  } catch (error) {
    console.error("Unable to load saved slider images:", error);
    return {
      slides: defaultSlides,
      error: "Saved slider images could not be loaded. You can upload them again.",
    };
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error(`Unable to process "${file.name}".`));
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      let quality = 0.82;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > 600_000 && quality > 0.5) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      if (dataUrl.length > 600_000) {
        reject(new Error(`"${file.name}" is too large to add to the slider.`));
        return;
      }

      resolve({ src: dataUrl, alt: file.name.replace(/\.[^.]+$/, "") });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to read "${file.name}" as an image.`));
    };

    image.src = objectUrl;
  });
}

function Home() {
  const [carousel, setCarousel] = useState(readSlides);
  const [activeSlide, setActiveSlide] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef(null);
  const slides = carousel.slides;
  const featuredProducts = products.slice(0, 8);
  const popularCategories = categories.slice(0, 4);

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

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setUploadMessage("");
    if (files.length === 0) return;

    const remainingSlots = maxSlides - slides.length;
    if (files.length > remainingSlots) {
      setUploadMessage(
        `You can add ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} to the slider.`
      );
      return;
    }

    const invalidFile = files.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );
    if (invalidFile) {
      setUploadMessage("Please choose JPG, PNG, or WebP image files.");
      return;
    }

    try {
      const newSlides = await Promise.all(files.map(compressImage));
      const updatedSlides = [...slides, ...newSlides];
      localStorage.setItem(slidesStorageKey, JSON.stringify(updatedSlides));
      setCarousel({ slides: updatedSlides, error: "" });
      setActiveSlide(slides.length);
      setUploadMessage(
        `${newSlides.length} image${newSlides.length === 1 ? "" : "s"} added to the slider.`
      );
    } catch (error) {
      console.error("Unable to save slider images:", error);
      setUploadMessage(
        error.name === "QuotaExceededError"
          ? "There isn't enough browser storage for these images. Try fewer or smaller images."
          : error.message || "Unable to add these images to the slider."
      );
    }
  };

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
          <img src={slides[activeSlide].src} alt={slides[activeSlide].alt} />

          <label className="am-home-upload">
            <ImagePlus size={17} aria-hidden="true" />
            <span>Add images</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              aria-label="Upload slider images"
            />
          </label>

          {slides.length > 1 && (
            <div className="am-home-slider-controls" aria-label="Hero image slider">
              <button
                type="button"
                onClick={() => showSlide(activeSlide - 1)}
                aria-label="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
              <div className="am-home-slider-dots">
                {slides.map((slide, index) => (
                  <button
                    key={`${slide.alt}-${index}`}
                    type="button"
                    className={index === activeSlide ? "active" : ""}
                    onClick={() => showSlide(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={index === activeSlide ? "true" : undefined}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => showSlide(activeSlide + 1)}
                aria-label="Next image"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          )}
        </div>
        {(carousel.error || uploadMessage) && (
          <p className="am-home-upload-message" role="status">
            {uploadMessage || carousel.error}
          </p>
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
