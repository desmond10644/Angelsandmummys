const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/+$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, options);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed (${response.status}).`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function adminHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export function getPublicHeroSlides() {
  return request("/api/hero-slides");
}

export function getAdminHeroSlides(token) {
  return request("/api/hero-slides/admin", {
    headers: adminHeaders(token),
  });
}

export function adminLogin(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((result) => {
    if (result.user?.role !== "admin") {
      throw new Error("This account does not have administrator access.");
    }
    return result;
  });
}

export function createHeroSlide(token, formData) {
  return request("/api/hero-slides/admin", {
    method: "POST",
    headers: adminHeaders(token),
    body: formData,
  });
}

export function updateHeroSlide(token, id, formData) {
  return request(`/api/hero-slides/admin/${id}`, {
    method: "PUT",
    headers: adminHeaders(token),
    body: formData,
  });
}

export function deleteHeroSlide(token, id) {
  return request(`/api/hero-slides/admin/${id}`, {
    method: "DELETE",
    headers: adminHeaders(token),
  });
}

export function reorderHeroSlides(token, ids) {
  return request("/api/hero-slides/admin/order", {
    method: "PUT",
    headers: {
      ...adminHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });
}

export function resolveSlideImage(imageUrl) {
  if (/^(https?:|data:|blob:|\/\/)/i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith("/uploads/")) return `${apiBaseUrl}${imageUrl}`;
  return imageUrl;
}
