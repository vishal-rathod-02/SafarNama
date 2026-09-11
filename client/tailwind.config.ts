/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          amber: {
            50: "#fffbeb",
            100: "#fef3c7",
            200: "#fde68a",
            300: "#fcd34d",
            400: "#fbbf24",
            500: "#f59e0b",
            600: "#d97706",
            700: "#b45309",
            800: "#92400e",
            900: "#78350f",
            950: "#451a03",
          },
          emerald: {
            50: "#ecfdf5",
            100: "#d1fae5",
            200: "#a7f3d0",
            300: "#6ee7b7",
            400: "#34d399",
            500: "#10b981",
            600: "#059669",
            700: "#047857",
            800: "#065f46",
            900: "#064e3b",
            950: "#022c22",
          },
        },
      },
      boxShadow: {
        "amber-glow": "0 0 20px rgba(245, 158, 11, 0.4)",
        "amber-glow-lg": "0 0 35px rgba(245, 158, 11, 0.5)",
      },
      keyframes: {
        dropdown: {
          "0%": { opacity: 0, transform: "scale(0.95) translateY(-10px)" },
          "100%": { opacity: 1, transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        dropdown: "dropdown 0.2s ease-out",
      },
    },
  },
  plugins: [],
};