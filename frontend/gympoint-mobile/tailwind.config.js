/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FAFAFA',
          dark: '#0F1419',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1A1F2E',
        },
        surfaceVariant: {
          DEFAULT: '#F5F5F5',
          dark: '#252B3D',
        },
        text: {
          DEFAULT: '#1A1A1A',
          dark: '#FFFFFF',
        },
        textSecondary: {
          DEFAULT: '#666666',
          dark: '#B0B8C8',
        },
        textMuted: {
          DEFAULT: '#999999',
          dark: '#6B7280',
        },
        primary: '#4A9CF5',
        primaryDark: '#3D7DC7',
        primaryLight: '#6BADFF',
        onPrimary: '#FFFFFF',
        secondary: '#F0F0E0',
        onSecondary: '#1A1A1A',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',
        border: {
          DEFAULT: '#DDDDDD',
          dark: '#2C3444',
        },
        divider: {
          DEFAULT: '#E0E0E0',
          dark: '#2C3444',
        },
        inputBorder: {
          DEFAULT: '#DDDDDD',
          dark: '#2C3444',
        },
        inputBorderFocused: '#4A9CF5',
        inputBorderError: '#F44336',
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
      },
    },
  },
  plugins: [],
};