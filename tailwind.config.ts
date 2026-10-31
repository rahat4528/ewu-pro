import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#bcdfff",
          300: "#8eccff",
          400: "#58b0f8",
          500: "#3193ee",
          600: "#1a75dc",
          700: "#145db4",
          800: "#154e92",
          900: "#174275",
          950: "#0f294c",
        },
        ewu: {
          navy: "#0a2540",
          crimson: "#c5221f",
          gold: "#f59e0b",
          teal: "#0d9488",
        },
      },
    },
  },
  plugins: [],
};

export default config;
