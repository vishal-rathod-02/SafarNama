import { apiFetch, API_BASE_URLS } from "../apiClient";

export const ImageService = {
  placeImage: async (query: string) =>
    apiFetch(
      `${API_BASE_URLS.IMAGE}/api/place-image?query=${encodeURIComponent(
        query
      )}`,
      {
        method: "GET",
      }
    ),
};
