/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#A3C981',       // primary-green
        secondary: '#D0DDC4',     // selection-light
        fresh: '#F8FAF5',         // bg-fresh
        mainText: '#1A1C1E',      // text-main
        mutedText: '#5B6056',     // text-muted
        bluePrimary: '#9CD8F7',
     },
      borderRadius: {
        'xl-custom': '30px',
      }
    },
  },
  plugins: [],
}