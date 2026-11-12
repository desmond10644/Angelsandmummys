import { apiRequest } from "./api";
import { resolveProductImage } from "./productService";

export async function getCart() {
  const data = await apiRequest("/api/account/cart");
  return data.items.map((item) => ({
    ...item,
    image: resolveProductImage(item.image),
  }));
}

export function saveCart(items) {
  return apiRequest("/api/account/cart", {
    method: "PUT",
    body: JSON.stringify({
      items: items.map((item) => ({
        productId: Number(item.id ?? item.productId),
        quantity: Number(item.quantity),
      })),
    }),
  });
}

export async function getWishlist() {
  const data = await apiRequest("/api/account/wishlist");
  return data.products.map((product) => ({
    ...product,
    image: resolveProductImage(product.image),
  }));
}

export function addWishlistItem(productId) {
  return apiRequest(`/api/account/wishlist/${encodeURIComponent(productId)}`, {
    method: "PUT",
  });
}

export function removeWishlistItem(productId) {
  return apiRequest(`/api/account/wishlist/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}