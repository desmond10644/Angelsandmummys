import { apiRequest } from "./api";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/+$/, "");

export function resolveProductImage(imageUrl) {
  if (!imageUrl || /^(https?:|data:|blob:|\/\/)/i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith("/uploads/")) return `${apiBaseUrl}${imageUrl}`;
  return imageUrl;
}

function mapProduct(product) {
  return { ...product, image: resolveProductImage(product.image) };
}

export async function getProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "All") {
    params.set("category", filters.category);
  }
  if (filters.query) params.set("q", filters.query);
  const search = params.toString();
  const query = search ? `?${search}` : "";
  const data = await apiRequest(`/api/products${query}`);
  return data.products.map(mapProduct);
}

export async function getProduct(id) {
  const data = await apiRequest(`/api/products/${encodeURIComponent(id)}`);
  return mapProduct(data.product);
}