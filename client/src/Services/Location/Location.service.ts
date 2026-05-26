import { apiFetch, API_BASE_URLS } from "../apiClient";

export const LocationService = {
  autocomplete: async (query: string) =>
    apiFetch(
      `${API_BASE_URLS.LOCATION}/api/autocomplete?input=${encodeURIComponent(
        query
      )}`,
      {
        method: "GET",
      }
    ),

  geocode: async (locationName: string) =>
    apiFetch(
      `${API_BASE_URLS.LOCATION}/api/geocode?locationName=${encodeURIComponent(
        locationName
      )}`,
      {
        method: "GET",
      }
    ),
};
