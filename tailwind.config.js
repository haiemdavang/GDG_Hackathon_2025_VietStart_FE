/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'golden-dream': {
          '50': '#fdfde9',
          '100': '#fbfcc5',
          '200': '#faf88e',
          '300': '#f7ed4d',
          '400': '#f2dc1d',
          '500': '#e9ca10',
          '600': '#c39a0b',
          '700': '#9c6f0c',
          '800': '#815812',
          '900': '#6e4815',
          '950': '#402608',
        },
        primary: '#e9ca10',
        contentText: '#334155',
        //title su dung text-slate-900
      },
      fontFamily: {
        sans: [
          'Inter var',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
  },
  plugins: [],
}

