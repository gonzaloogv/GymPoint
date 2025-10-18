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
      },
      animation: {
        'spin': 'spin 1s linear infinite',
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