/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2C2C2C',
        'secondary': '#D4AF37',
        'background': '#FFFFFF',
        'surface': '#F8F8F8',
        'text-primary': '#1A1A1A',
        'text-secondary': '#4A4A4A',
        'accent': '#4A7C59',
      },
      fontFamily: {
        'heading': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
