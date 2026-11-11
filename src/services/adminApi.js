const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function adminRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem("token");

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error("Unable to connect to the server. Check the API URL and try again.");
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }

  return data;
}