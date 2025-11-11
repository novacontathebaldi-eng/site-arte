/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       colors: {
        'primary': '#1E40AF',
        'secondary': '#3B82F6',
        'background': '#F3F4F6',
        'surface': '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#4B5563',
      }
    },
  },
  plugins: [],
}
