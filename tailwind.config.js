/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      colors: {
        base: '#070A10',
        surface: '#0B1020',
        card: '#0F172A',
        'card-hover': '#131E36',
        'input-bg': '#070D1A',
        border: '#1E293B',
        'border-bright': '#334155',
        // Primary accent
        accent: '#E04D33',
        cyan: '#06b6d4',
        purple: '#8b5cf6',
        emerald: '#10b981',
        amber: '#f59e0b',
        danger: '#ef4444',
      },
      animation: {
        'fade-slide': 'fadeSlideIn 0.25s ease forwards',
        'toast-in': 'toastIn 0.3s ease forwards',
      },
      keyframes: {
        fadeSlideIn: {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        toastIn: {
          from: { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
