
import { SlidersHorizontal } from "lucide-react";
import "./ProductFilter.css";

function ProductFilter({
  categories = [],
  selectedCategory = "All",
  onCategoryChange,
  sortBy = "newest",
  onSortChange
}) {
  return (
    <div className="am-product-filter">
      <div className="am-filter-heading">
        <SlidersHorizontal size={19} />
        <h3>Filter Products</h3>
      </div>

      <div className="am-filter-group">
        <label htmlFor="am-category-filter">Category</label>

        <select
          id="am-category-filter"
          value={selectedCategory}
          onChange={(event) => onCategoryChange?.(event.target.value)}
        >
          <option value="All">All Categories</option>

          {categories.map((category) => {
            const name =
              typeof category === "string" ? category : category.name;

            return (
              <option key={name} value={name}>
                {name}
              </option>
            );
          })}
        </select>
      </div>

      <div className="am-filter-group">
        <label htmlFor="am-sort-filter">Sort By</label>

        <select
          id="am-sort-filter"
          value={sortBy}
          onChange={(event) => onSortChange?.(event.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  );
}

export default ProductFilter;
