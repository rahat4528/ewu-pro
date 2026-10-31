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
        // EWU Portal Official Palette (referenced directly from https://portal.ewubd.edu/)
        ewu: {
          navy: {
            DEFAULT: "#1C4370",
            50: "#f0f4f9",
            100: "#dbe5f1",
            200: "#bccde3",
            300: "#92aed1",
            400: "#6289bc",
            500: "#416ca6",
            600: "#2f558a",
            700: "#264470",
            800: "#1C4370", // Official EWU Portal Primary
            900: "#173456",
            950: "#0f2139",
          },
          teal: {
            DEFAULT: "#1CAF9A",
            50: "#effaf7",
            100: "#d6f3ed",
            200: "#b0e8dc",
            300: "#7bd6c4",
            400: "#44beaa",
            500: "#1CAF9A", // Official EWU Portal Accent
            600: "#168e7d",
            700: "#157165",
            800: "#165a52",
            900: "#164b44",
            950: "#072c29",
          },
          sky: {
            DEFAULT: "#3186a4",
            light: "#4ca5c4",
            dark: "#245269",
          },
          bg: {
            DEFAULT: "#f0f4f5", // Official portal body background
            soft: "#f9fbfc",
            card: "#ffffff",
          },
          border: "#E4E7EA",
          muted: "#686a6a",
          dark: "#2c3e50",
          success: "#5cb85c",
          warning: "#F0AD4E",
          danger: "#D9534F",
        },
        primary: {
          50: "#f0f4f9",
          100: "#dbe5f1",
          200: "#bccde3",
          300: "#92aed1",
          400: "#6289bc",
          500: "#416ca6",
          600: "#2f558a",
          700: "#1C4370", // EWU Portal Navy
          800: "#173456",
          900: "#0f2139",
          950: "#091424",
        },
      },
    },
  },
  plugins: [],
};

export default config;
