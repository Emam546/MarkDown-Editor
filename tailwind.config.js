/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**', './src/renderer/index.html'],
  theme: {
    extend: {}
  },
  plugins: [require('@tailwindcss/typography')]
}
