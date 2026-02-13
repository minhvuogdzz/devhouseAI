/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        cursive: ['"Dancing Script"', 'cursive'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' }, 
          '50%': { transform: 'translateY(-10px)' },  
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float-slow': 'float 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}