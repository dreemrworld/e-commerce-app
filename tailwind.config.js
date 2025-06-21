/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1865f2', // Blue (User Specified)
        secondary: '#79A6DC', // Lighter Blue
        accent: '#F5A623',   // Orange
        background: '#F8F9FA', // Very Light Gray
        surface: '#FFFFFF',   // White
        textPrimary: '#212529', // Near Black
        textSecondary: '#6C757D', // Dark Gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // From your index.html
      },
    },
  },
  plugins: [],
}
