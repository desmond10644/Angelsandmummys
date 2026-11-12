import { apiRequest } from "./api";

export async function getProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "All") {
    params.set("category", filters.category);
  }
  if (filters.query) params.set("q", filters.query);
  const search = params.toString();
  const query = search ? `?${search}` : "";
  const data = await apiRequest(`/api/products${query}`);
  return data.products;
}

export async function getProduct(id) {
  const data = await apiRequest(`/api/products/${encodeURIComponent(id)}`);
  return data.product;
}