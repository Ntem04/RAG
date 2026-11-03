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
        poly: {
          navy: "#0e2a47",
          deepNavy: "#081b2e",
          blue: "#0f3b6c",
          gold: "#c59b27",
          goldDark: "#b8860b",
          goldHover: "#a07507",
          lightBlue: "#eef4fa",
          accent: "#2563eb",
          dark: "#0a2544",
          sidebar: "#0d2238"
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        redaction: ['"Redaction 35"', 'Georgia', 'serif'],
        display: ['"Redaction 35"', 'Georgia', 'serif'],
        serif: ['"Redaction 35"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
