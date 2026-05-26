import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env variables from the current directory (client/)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      // Expose only the needed environment variables to the frontend
      "process.env.VITE_PEXELS_API_KEY": JSON.stringify(env.VITE_PEXELS_API_KEY),
      "process.env.VITE_AUTH_SERVER_URL": JSON.stringify(env.VITE_AUTH_SERVER_URL),
      "process.env.VITE_IMAGE_SERVER_URL": JSON.stringify(env.VITE_IMAGE_SERVER_URL),
      "process.env.VITE_LOCATION_SERVER_URL": JSON.stringify(env.VITE_LOCATION_SERVER_URL),
      "process.env.VITE_TRIP_SERVER_URL": JSON.stringify(env.VITE_TRIP_SERVER_URL),
    },
    plugins: [
      react(),
      tsconfigPaths(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),        // main alias for imports
        "@Assets": path.resolve(__dirname, "src/Assets"),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});