
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import ProductFilter from "../components/ProductFilter";
import CatalogStatus from "../components/CatalogStatus";
import { getCategories } from "../services/categoryService";
import { localImages } from "../data/localImages";
import { useStore } from "../context/useStore";
import "./Shop.css";

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, catalogLoading, catalogError, refreshProducts } = useStore();

  const [search, setSearch] = useState("");
  const category = searchParams.get("category") || "All";
  const [sortBy, setSortBy] = useState("newest");
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    let active = true;
    getCategories()
      .then((items) => {
        if (active) setCategories(items);
      })
      .catch((error) => {
        if (active) setCategoriesError(error.message);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedCategory = categories.find(
    (item) => item.name.toLowerCase() === category.toLowerCase()
  );
  const bannerStyle = {
    "--am-shop-hero-image": `url("${selectedCategory?.image || localImages.storefront}")`,
  };

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
  }, [products, search, category, sortBy]);

  return (
    <main className="am-shop">
      <section className="am-shop-banner" style={bannerStyle}>
        <div>
          <span>{category === "All" ? "OUR COLLECTION" : "SHOP BY CATEGORY"}</span>
          <h1>{category === "All" ? "Shop All Products" : category}</h1>
          <p>
            {selectedCategory?.description || "Explore essentials selected for mothers, babies and kids."}
          </p>
        </div>
      </section>

      {categoriesError && category !== "All" && (
        <p className="am-shop-category-error" role="status">{categoriesError}</p>
      )}
      <div className="am-shop-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search for products..."
        />

        <ProductFilter
          categories={categoryNames}
          selectedCategory={category}
          onCategoryChange={(nextCategory) => {
            const nextParams = new URLSearchParams(searchParams);
            if (nextCategory === "All") nextParams.delete("category");
            else nextParams.set("category", nextCategory);
            setSearchParams(nextParams);
          }}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      <div className="am-shop-heading">
        <h2>Our Products</h2>
        <span>{filteredProducts.length} product(s) found</span>
      </div>

      <CatalogStatus loading={catalogLoading} error={catalogError} onRetry={refreshProducts} />
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
              setSearchParams({});
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
