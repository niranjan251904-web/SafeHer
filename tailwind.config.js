/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAFE',
        primary: '#9B59B6',
        secondary: '#E0457B',
        alert: '#E74C3C',
        safe: '#27AE60',
        gold: '#F39C12',
        surface: '#FFFFFF',
        'surface-2': '#F3F0F8',
        'purple-glow': '#7C3AED',
        'pink-glow': '#EC4899',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #FAFAFE 0%, #F3F0F8 50%, #FAFAFE 100%)',
      },
      animation: {
        'pulse-shield': 'pulseShield 2s ease-in-out infinite',
        'glow-ring': 'glowRing 2s ease-out infinite',
        'heartbeat': 'heartbeat 1.2s ease-in-out infinite',
        'ticker': 'ticker 30s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseShield: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        glowRing: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(2.5)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(155, 89, 182, 0.25)',
        'glow-pink': '0 0 20px rgba(224, 69, 123, 0.25)',
        'glow-red': '0 0 30px rgba(231, 76, 60, 0.5)',
        'glass': '0 8px 32px rgba(155, 89, 182, 0.08)',
      },
    },
  },
  plugins: [],
};
