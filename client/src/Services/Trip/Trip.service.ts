import { apiFetch, API_BASE_URLS } from "../apiClient";

export const TripService = {
  generate: async (data: any) =>
    apiFetch(`${API_BASE_URLS.TRIP}/api/trips/generate`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  save: async (data: any) =>
    apiFetch(`${API_BASE_URLS.TRIP}/api/trips/save`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  myTrips: async () =>
    apiFetch(`${API_BASE_URLS.TRIP}/api/trips/mytrips`, {
      method: "GET",
    }),

  favorite: async (id: string) =>
    apiFetch(`${API_BASE_URLS.TRIP}/api/trips/favorite/${id}`, {
      method: "POST", // assuming POST/PATCH
    }),

  deleteTrip: async (id: string) =>
    apiFetch(`${API_BASE_URLS.TRIP}/api/trips/${id}`, {
      method: "DELETE",
    }),

  overview: async () =>
    apiFetch(`${API_BASE_URLS.TRIP}/api/trips/overview`, {
      method: "GET",
    }),
};
