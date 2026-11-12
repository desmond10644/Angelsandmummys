
import ProductCard from "../components/ProductCard";
import CatalogStatus from "../components/CatalogStatus";
import { useStore } from "../context/useStore";
import "./Kids.css";

function Kids() {
  const { products, catalogLoading, catalogError, refreshProducts } = useStore();
  const kidsProducts = products.filter((product) =>
    /kid|kids|child|children|toddler|toy|school/i.test(
      `${product.category || ""} ${product.name || ""} ${product.description || ""}`
    )
  );

  return (
    <main className="am-kids-page">
      <section className="am-kids-banner">
        <span>FOR LITTLE EXPLORERS</span>
        <h1>Kids' Collection</h1>
        <p>
          Find fun and practical products for playtime,
          learning and growing.
        </p>
      </section>

      <div className="am-kids-heading">
        <h2>Products for Kids</h2>
        <span>{kidsProducts.length} product(s)</span>
      </div>

      <CatalogStatus loading={catalogLoading} error={catalogError} onRetry={refreshProducts} />
      {kidsProducts.length > 0 ? (
        <div className="am-kids-grid">
          {kidsProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="am-kids-empty">
          <h3>Kids' products are coming soon.</h3>
          <p>Explore our full shop for other available items.</p>
        </div>
      )}
    </main>
  );
}

export default Kids;
