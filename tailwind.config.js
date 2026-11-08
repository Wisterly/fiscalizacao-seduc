/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#060911',
          900: '#090D16',
          850: '#0D1424',
          800: '#111827',
          700: '#1E293B',
          600: '#334155',
        },
        brand: {
          orange: '#F97316',
          gold: '#EAB308',
          turquoise: '#06B6D4',
          teal: '#14B8A6',
          navy: '#090D16',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-glow-orange': '0 0 25px rgba(249, 115, 22, 0.22)',
        'glass-glow-gold': '0 0 25px rgba(234, 179, 8, 0.22)',
        'glass-glow-turq': '0 0 25px rgba(6, 182, 212, 0.22)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-lg': '24px',
      }
    },
  },
  plugins: [],
}
