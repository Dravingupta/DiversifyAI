/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        ink: '#101828',
        mint: '#6ee7b7',
        sky: '#7dd3fc',
        peach: '#fdba74',
        sand: '#fff7ed',
      },
      boxShadow: {
        glow: '0 20px 60px rgba(15, 23, 42, 0.18)',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floatSlow: 'floatSlow 7s ease-in-out infinite',
        riseIn: 'riseIn 700ms ease forwards',
      },
    },
  },
  plugins: [],
};
