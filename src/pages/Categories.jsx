
import { useEffect, useState } from "react";
import CatalogStatus from "../components/CatalogStatus";
import CategoryCard from "../components/CategoryCard";
import { useStore } from "../context/useStore";
import { getCategories } from "../services/categoryService";
import { localImages } from "../data/localImages";
import { getCatalogCategories } from "../utils/catalog";
import "./Categories.css";

function Categories() {
  const { products, catalogLoading, catalogError, refreshProducts } = useStore();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    let active = true;
    getCategories()
      .then((items) => {
        if (active) setCategories(items);
      })
      .catch((error) => {
        if (active) setCategoriesError(error.message);
      })
      .finally(() => {
        if (active) setCategoriesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);
  const visibleCategories = categories.length > 0
    ? categories
    : getCatalogCategories(products);

  return (
    <main className="am-categories-page">
      <section
        className="am-categories-header"
        style={{ "--am-category-hero-image": `url("${localImages.familyShopping}")` }}
      >
        <div>
          <span>EXPLORE OUR STORE</span>
          <h1>Shop by Category</h1>
          <p>Browse our collections created for mothers, babies and kids.</p>
        </div>
      </section>

      <CatalogStatus loading={catalogLoading} error={catalogError} onRetry={refreshProducts} />
      {categoriesError && <p className="am-categories-error" role="alert">{categoriesError}</p>}
      {categoriesLoading ? (
        <p className="am-categories-empty" role="status">Loading categories...</p>
      ) : visibleCategories.length > 0 ? (
        <div className="am-categories-grid">
          {visibleCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={{
                ...category,
                description: category.description || `Explore our ${category.name} collection.`,
                image: category.image,
                product_count: category.product_count ?? products.filter(
                  (product) => product.category === category.name
                ).length,
              }}
            />
          ))}
        </div>
      ) : (
        <p className="am-categories-empty">
          No categories have been added yet.
        </p>
      )}
    </main>
  );
}

export default Categories;
