import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/containers/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        funnel: ["Funnel Display", "sans-serif"],
      },
      colors: {
        primary: "#0A4FA6",
        secondary: "#0891B2",
        accent: "#0D9E6E",
        success: "#059669",
        warning: "#D97706",
        danger: "#DC2626",
        surface: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
