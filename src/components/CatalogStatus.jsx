function CatalogStatus({ loading, error, onRetry }) {
  if (loading) return <p role="status">Loading products from the store...</p>;
  if (!error) return null;
  return (
    <div role="alert">
      <p>{error}</p>
      <button type="button" onClick={onRetry}>Try again</button>
    </div>
  );
}

export default CatalogStatus;
