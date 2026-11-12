import { apiRequest } from "./api";

export function login(email, password) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(values) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(values),
  });
}