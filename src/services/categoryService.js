import { apiRequest } from "./api";
import { resolveProductImage } from "./productService";
import { categories as knownCategories } from "../data/categories";

export async function getCategories() {
  const data = await apiRequest("/api/products/categories");
  return data.categories.map((category) => {
    const name = category.category;
    const known = knownCategories.find(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );
    return {
      ...category,
      id: name,
      name,
      image: resolveProductImage(category.image_url) || known?.image || "/placeholder.png",
      description: known?.description || `Explore our ${name} collection.`,
    };
  });
}