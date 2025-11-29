/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF0000',
        secondary: '#282828',
        dark: '#0F0F0F',
        'dark-hover': '#272727',
      },
    },
  },
  plugins: [],
}
