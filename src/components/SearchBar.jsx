
import { Search, X } from "lucide-react";
import "./SearchBar.css";

function SearchBar({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Search for products..."
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form className="am-search-bar" onSubmit={handleSubmit}>
      <Search size={20} className="am-search-icon" />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
      />

      {value && (
        <button
          type="button"
          className="am-search-clear"
          onClick={() => onChange?.("")}
          aria-label="Clear search"
        >
          <X size={17} />
        </button>
      )}

      <button type="submit" className="am-search-submit">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
