
import ProductCard from "../components/ProductCard";
import CatalogStatus from "../components/CatalogStatus";
import { useStore } from "../context/useStore";
import "./Maternity.css";

function Maternity() {
  const { products, catalogLoading, catalogError, refreshProducts } = useStore();
  const maternityProducts = products.filter((product) =>
    /maternity|pregnancy|mother|nursing/i.test(
      `${product.category || ""} ${product.name || ""} ${product.description || ""}`
    )
  );

  return (
    <main className="am-maternity-page">
      <section className="am-maternity-banner">
        <span>FOR THE JOURNEY OF MOTHERHOOD</span>
        <h1>Maternity Collection</h1>
        <p>
          Explore thoughtful essentials for pregnancy,
          recovery and nursing.
        </p>
      </section>

      <div className="am-maternity-heading">
        <h2>Products for Mums</h2>
        <span>{maternityProducts.length} product(s)</span>
      </div>

      <CatalogStatus loading={catalogLoading} error={catalogError} onRetry={refreshProducts} />
      {maternityProducts.length > 0 ? (
        <div className="am-maternity-grid">
          {maternityProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="am-maternity-empty">
          <h3>Our maternity collection is being updated.</h3>
          <p>Visit our shop to explore other available products.</p>
        </div>
      )}
    </main>
  );
}

export default Maternity;
