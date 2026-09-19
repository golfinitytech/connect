/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16D84E',
        'primary-dark': '#0E9F39',
        background: '#F3F7F5',
        surface: '#FFFFFF',
        text: '#111513',
        muted: '#60706A',
        'dark-sidebar': '#1A1F26',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        teko: ['Teko', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

