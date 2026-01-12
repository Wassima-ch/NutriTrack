/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#A3C981',       
        secondary: '#D0DDC4',    
        fresh: '#F8FAF5',         
        mainText: '#1A1C1E',     
        mutedText: '#5B6056',     
        bluePrimary: '#9CD8F7',
     },
      borderRadius: {
        'xl-custom': '30px',
      }
    },
  },
  plugins: [],
}