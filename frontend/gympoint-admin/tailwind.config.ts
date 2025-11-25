/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        bg: {
          DEFAULT: '#FAFAFA',
          dark: '#1A1A1A',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#2D2D2D',
        },
        text: {
          DEFAULT: '#1A1A1A',
          dark: '#FAFAFA',
        },
        subtext: {
          DEFAULT: '#1A1A1A',
          dark: '#E0E0E0',
        },
        primary: {
          DEFAULT: '#4F9CF9',
          text: '#FFFFFF',
          hover: '#3d7dc7',
        },
        border: {
          DEFAULT: '#DDDDDD',
          dark: '#404040',
        },
        input: {
          bg: {
            DEFAULT: '#FFFFFF',
            dark: '#2D2D2D',
          },
          border: {
            DEFAULT: '#DDDDDD',
            dark: '#404040',
          },
        },
        success: '#4CAF50',
        warning: '#FF9800',
        danger: '#F44336',
        muted: {
          DEFAULT: '#E0E0E0',
          dark: '#404040',
        },
        'text-muted': '#9E9E9E',
      },
      borderRadius: {
        'card': '14px',
        'input': '10px',
        'button': '10px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'modal': '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
      maxWidth: {
        'container': '1400px',
      },
      spacing: {
        'navbar': '2rem',
        'content': '2rem',
      },
      fontSize: {
        'stat': '2.5rem',
      },
      keyframes: {
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseGentle: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(79, 156, 249, 0.1)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
  ],
}