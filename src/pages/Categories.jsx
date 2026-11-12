
import CatalogStatus from "../components/CatalogStatus";
import CategoryCard from "../components/CategoryCard";
import { useStore } from "../context/useStore";
import { getCatalogCategories } from "../utils/catalog";
import "./Categories.css";

function Categories() {
  const { products, catalogLoading, catalogError, refreshProducts } = useStore();
  const categories = getCatalogCategories(products);

  return (
    <main className="am-categories-page">
      <section className="am-categories-header">
        <span>EXPLORE OUR STORE</span>
        <h1>Shop by Category</h1>
        <p>
          Browse our collections created for mothers, babies and kids.
        </p>
      </section>

      <CatalogStatus loading={catalogLoading} error={catalogError} onRetry={refreshProducts} />
      {categories.length > 0 ? (
        <div className="am-categories-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
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
