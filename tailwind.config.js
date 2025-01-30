/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-red': '#E63946',
        'custom-orange': '#F4A261',
        'custom-blue': '#264653',
        'custom-yellow': '#E9C46A',
      },
    },
  },
  plugins: [],
};