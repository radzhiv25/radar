/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        radar: {
          accent: '#78716c',
          'accent-dark': '#a8a29e',
        },
      },
      fontFamily: {
        sans: ['System'],
        mono: ['SpaceMono'],
      },
    },
  },
  plugins: [],
};
