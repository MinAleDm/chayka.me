/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",        // страницы и layout
    "./src/components/**/*.{js,ts,jsx,tsx}", // компоненты
    "./src/pages/**/*.{js,ts,jsx,tsx}"       // если есть pages
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
