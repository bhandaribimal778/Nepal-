/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nepalcrimson: {
          DEFAULT: '#C91D24',
          dark: '#991B1B',
          light: '#FEE2E2',
        },
        nepalnavy: {
          DEFAULT: '#0F172A',
          surface: '#1E293B',
          elevated: '#334155',
        }
      },
      fontFamily: {
        sans: ['Mukta', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
