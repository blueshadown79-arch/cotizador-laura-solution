/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0f2744',
          navyDark: '#0a1a2e',
          navyLight: '#1b3b64',
          glass: '#0284c7',
          glassLight: '#38bdf8',
          glassPale: '#e0f2fe',
          accent: '#2563eb',
        }
      }
    },
  },
  plugins: [],
}
