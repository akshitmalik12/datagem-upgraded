/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Arial', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      colors: {
        canvas: {
          deep: '#05070A',
          card: '#090D14',
          subtle: '#0F1622',
          border: '#1E293B',
        },
        brand: {
          sky: '#38BDF8',
          blue: '#0284C7',
          emerald: '#34D399',
          rose: '#FB7185',
        }
      }
    },
  },
  plugins: [],
}
