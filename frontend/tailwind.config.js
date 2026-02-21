/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4F6EF7',
          50: '#EEF1FE',
          100: '#D9E0FD',
          200: '#B3C1FB',
          300: '#8DA2F9',
          400: '#6783F8',
          500: '#4F6EF7',
          600: '#2246F5',
          700: '#0A31E6',
          800: '#0929BF',
          900: '#072298',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          50: '#F8F9FE',
          100: '#F1F3FC',
          200: '#E4E8F9',
        },
        dark: {
          DEFAULT: '#0F1117',
          50: '#1A1D27',
          100: '#252836',
          200: '#313546',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'like-pop': 'likePop 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        likePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
