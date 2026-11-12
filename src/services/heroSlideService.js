import { apiRequest } from "./api";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/+$/, "");

export function getPublicHeroSlides() {
  return apiRequest("/api/hero-slides");
}

export function getAdminHeroSlides() {
  return apiRequest("/api/hero-slides/admin");
}

export function createHeroSlide(formData) {
  return apiRequest("/api/hero-slides/admin", {
    method: "POST",
    body: formData,
  });
}

export function updateHeroSlide(id, formData) {
  return apiRequest(`/api/hero-slides/admin/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export function deleteHeroSlide(id) {
  return apiRequest(`/api/hero-slides/admin/${id}`, {
    method: "DELETE",
  });
}

export function reorderHeroSlides(ids) {
  return apiRequest("/api/hero-slides/admin/order", {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
}

export function resolveSlideImage(imageUrl) {
  if (/^(https?:|data:|blob:|\/\/)/i.test(imageUrl)) return imageUrl;
  if (
    imageUrl.startsWith("/uploads/") ||
    imageUrl.startsWith("/storefront-hero-images/")
  ) {
    return `${apiBaseUrl}${imageUrl}`;
  }
  return imageUrl;
}
