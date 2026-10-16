import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function apiRequest(path, options = {}) {
  const token = options.token ?? getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Tidak dapat terhubung ke server. Pastikan backend Express.js sedang berjalan."
    );
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada server.");
  }

  return data;
}

export async function loginRequest(nip, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ nip, password }),
    token: null,
  });
}

export async function getCurrentUser(token) {
  return apiRequest("/auth/me", {
    method: "GET",
    token,
  });
}
