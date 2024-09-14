/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        pine: {
          50: '#f3f7ee',
          100: '#e4ecdb',
          200: '#cddbbb',
          300: '#adc492',
          400: '#8ead6e',
          500: '#719151',
          600: '#58723e',
          700: '#445932',
          800: '#39482c',
          900: '#34412a',
          950: '#182112',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
