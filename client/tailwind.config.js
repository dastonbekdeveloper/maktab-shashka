/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          light: '#e0c49f',
          dark: '#7a4829',
          border: '#4a2810'
        }
      }
    },
  },
  plugins: [],
}
