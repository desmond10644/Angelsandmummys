
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import "./Search.css";

function Search() {
  const [params] = useSearchParams();
  const initialQuery = params.get("q") || "";
  const [search, setSearch] = useState(initialQuery);

  const results = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return [];

    return products.filter((product) =>
      `${product.name} ${product.category} ${product.description || ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [search]);

  return (
    <section className="am-search-page">
      <div className="am-search-header">
        <h1>Search Products</h1>
        <p>Find the perfect products for mothers, babies and kids.</p>
      </div>

      <input
        className="am-search-input"
        type="search"
        placeholder="Search for products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {search.trim() && (
        <p className="am-search-count">
          {results.length} result(s) for "{search}"
        </p>
      )}

      <div className="am-search-grid">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {search.trim() && results.length === 0 && (
        <div className="am-search-empty">
          <h2>No products found</h2>
          <p>Try another product name or category.</p>
        </div>
      )}

      {!search.trim() && (
        <div className="am-search-empty">
          <h2>What are you looking for?</h2>
          <p>Enter a product name or category to get started.</p>
        </div>
      )}
    </section>
  );
}

export default Search;
