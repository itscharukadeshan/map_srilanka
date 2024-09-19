/** @format */

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Make sure Tailwind scans TS/TSX files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
