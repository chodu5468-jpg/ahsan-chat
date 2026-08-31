const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  getUsers: (token, search) =>
    request(`/users${search ? `?search=${encodeURIComponent(search)}` : ""}`, { token }),
  getMessages: (token, otherId) => request(`/messages/${otherId}`, { token }),
};

export { API_URL };
