import { categories as knownCategories } from "../data/categories";

export function getCatalogCategories(products) {
  const counts = new Map();
  for (const product of products) {
    if (product.category) {
      counts.set(product.category, (counts.get(product.category) || 0) + 1);
    }
  }

  return [...counts].map(([name, product_count]) => {
    const known = knownCategories.find(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );
    return {
      ...(known || {}),
      id: known?.id ?? name,
      name,
      product_count,
      image: known?.image || "/placeholder.png",
      description: known?.description || `Explore our ${name} collection.`,
    };
  });
}
