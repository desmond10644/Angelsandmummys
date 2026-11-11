
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import ProductFilter from "../components/ProductFilter";
import "./Shop.css";

function Shop() {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [sortBy, setSortBy] = useState("newest");

  const categoryNames = [
    ...new Set(products.map((product) => product.category).filter(Boolean))
  ];

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const searchText = `
        ${product.name || ""}
        ${product.description || ""}
        ${product.category || ""}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
      );
    }

    if (sortBy === "newest") {
      result.reverse();
    }

    return result;
  }, [search, category, sortBy]);

  return (
    <main className="am-shop">
      <section className="am-shop-banner">
        <span>OUR COLLECTION</span>
        <h1>Shop All Products</h1>
        <p>
          Explore essentials selected for mothers, babies and kids.
        </p>
      </section>

      <div className="am-shop-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search for products..."
        />

        <ProductFilter
          categories={categoryNames}
          selectedCategory={category}
          onCategoryChange={setCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      <div className="am-shop-heading">
        <h2>Our Products</h2>
        <span>{filteredProducts.length} product(s) found</span>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="am-shop-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="am-shop-empty">
          <h3>No products found</h3>
          <p>Try another search term or category.</p>

          <button
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </main>
  );
}

export default Shop;
