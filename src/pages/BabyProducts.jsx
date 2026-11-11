
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import "./BabyProducts.css";

function BabyProducts() {
  const babyProducts = products.filter((product) =>
    /baby|newborn|infant|feeding|diaper|nappy|stroller/i.test(
      `${product.category || ""} ${product.name || ""} ${product.description || ""}`
    )
  );

  return (
    <main className="am-baby-page">
      <section className="am-baby-banner">
        <span>LITTLE THINGS, BIG LOVE</span>
        <h1>Baby Products</h1>
        <p>
          Discover everyday essentials to keep your little
          one comfortable and cared for.
        </p>
      </section>

      <div className="am-baby-heading">
        <h2>Baby Essentials</h2>
        <span>{babyProducts.length} product(s)</span>
      </div>

      {babyProducts.length > 0 ? (
        <div className="am-baby-grid">
          {babyProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="am-baby-empty">
          <h3>Baby products are coming soon.</h3>
          <p>Explore our full shop for other available items.</p>
        </div>
      )}
    </main>
  );
}

export default BabyProducts;
