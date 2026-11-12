import { apiRequest } from "./api";

export async function getAccountProfile() {
  const data = await apiRequest("/api/account/profile");
  return data.user;
}
