/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'bloom-primary': '#E6B8A2',
        'bloom-secondary': '#8B5A2B',
        'bloom-accent': '#FFE4E1',
        'bloom-mint': '#C1E1C1',
        'bloom-coral': '#FFBCB3',
        'bloom-cream': '#FFF5E1',
        'bloom-dark': '#3B2F2F',
        'bloom-turquoise': '#40C4D4',
        'bloom-pink': '#FF69B4',
        'bloom-yellow': '#FFD700'
      },
      fontFamily: {
        'brand': ['Pacifico', 'cursive'],
        'sans': ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 182, 193, 0.5)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(255, 182, 193, 0.8)',
          },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 182, 193, 0.5)',
        'glow-lg': '0 0 40px rgba(255, 182, 193, 0.8)',
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}