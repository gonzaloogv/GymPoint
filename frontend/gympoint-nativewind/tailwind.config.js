/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}','./app/**/*.{js,jsx,ts,tsx}','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gp: {
          primary: '#5B4BCE',
          primaryDark: '#4636A8',
          bg: '#F7F7FB',
          text: '#111318',
          muted: '#8A8FA0',
          card: '#FFFFFF',
        },
      },
      borderRadius: { xl: '14px', '2xl': '20px' },
    },
  },
  plugins: [],
};
