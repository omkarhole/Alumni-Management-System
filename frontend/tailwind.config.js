/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ensure good contrast in both light and dark modes
        text: {
          light: '#000000',
          dark: '#ffffff',
        },
        bg: {
          light: '#ffffff',
          dark: '#1a1a1a',
        }
      }
    },
  },
  plugins: [],
}