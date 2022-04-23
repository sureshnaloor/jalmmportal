module.exports = {
  darkMode:'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'light-primary':'#E5E7EB',
        'light-secondary':'#D1D5DB',
        'dark-primary':'#1F2937',
        'dark-secondary':'#111827'
      },
      fontFamily:{
        Rampart:["Rampart One", "Helvetica", "Arial", "sans-serif"],
        Montserrat:["Montserrat", "Helvetica", "Arial", "sans-serif"]
    },
  },
  plugins: [],
}
}
