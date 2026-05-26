

let isRefreshing = false;
let refreshQueue: ((token: string | null) => void)[] = [];

const processQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

export const API_BASE_URLS = {
  LOCATION: import.meta.env.VITE_LOCATION_SERVER_URL || "http://localhost:3000",
  AUTH: import.meta.env.VITE_AUTH_SERVER_URL || "http://localhost:3000",
  IMAGE: import.meta.env.VITE_IMAGE_SERVER_URL || "http://localhost:3000",
  TRIP: import.meta.env.VITE_TRIP_SERVER_URL || "http://localhost:3000",
};

export async function apiFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("safarnama-token");

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  const isAuthEndpoint =
    typeof input === "string" && input.includes("/api/auth/");

  // 🔁 Refresh only when safe
  if (response.status === 401 && token && !isAuthEndpoint) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshRes = await fetch(
          `${API_BASE_URLS.AUTH}/api/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        const refreshData = await refreshRes.json();

        if (!refreshRes.ok || !refreshData.success) {
          processQueue(null);
          throw new Error("Refresh failed");
        }

        localStorage.setItem(
          "safarnama-token",
          refreshData.data.token
        );

        processQueue(refreshData.data.token);
      } catch (err) {
        localStorage.removeItem("safarnama-token");

        window.dispatchEvent(new CustomEvent("auth:expired"));
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    return new Promise((resolve, reject) => {
      refreshQueue.push((newToken) => {
        if (!newToken) return reject(new Error("Session expired"));

        headers.set("Authorization", `Bearer ${newToken}`);
        fetch(input, { ...init, headers, credentials: "include" })
          .then(resolve)
          .catch(reject);
      });
    });
  }

  return response;
}
