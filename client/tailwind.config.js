/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        italiana: ['Italiana']
      },

      colors: {
        'beyond-green': '#A1B09B',
        'beyond-primary': '#1D1D1B',
        'beyond-light': '#EDEBE8',
        'beyond-darkgreen': '#79867B',
        'beyond-brown': '#BEAE97'
      }
    }
  },
  plugins: []
};
