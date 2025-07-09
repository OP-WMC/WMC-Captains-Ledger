/** @type {import('tailwindcss').Config} */
import textshadow from 'tailwindcss-textshadow';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      textShadow: {
      glow: '0 0 10px #00e0ff',
    },
      colors: {
        'avengers-blue': '#1e3a8a',
        'avengers-red': '#dc2626',
        'avengers-silver': '#cbd5e1',
        'avengers-dark': '#0f172a',
        'avengers-gray': '#1e293b',
        'avengers-light-blue': '#3b82f6',
        'avengers-gold': '#f59e0b',

        border: '#e5e7eb',
        input: '#f9fafb',
        ring: '#3b82f6',
        background: '#ffffff',
        foreground: '#000000',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        russo: ['"Russo One"', 'sans-serif'],
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
      },
      keyframes: {
        'glow-border': {
      '0%, 100%': {
        boxShadow: '0 0 20px #00e0ff44',
        borderColor: '#00e0ff',
      },
      '50%': {
        boxShadow: '0 0 35px #00bcd4',
        borderColor: '#00bcd4',
      },
    },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' }
        },
        blink: {
          '0%, 100%': { borderColor: '#00e0ff' },
          '50%': { borderColor: 'transparent' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 8px #00e0ff' },
          '50%': { textShadow: '0 0 20px #00e0ff' },
        },
        shine: {
          '0%': { left: '-75%' },
          '100%': { left: '125%' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%': { transform: 'translateX(10px)' },
          '20%': { transform: 'translateX(-8px)' },
          '30%': { transform: 'translateX(6px)' },
          '40%': { transform: 'translateX(-4px)' },
          '50%': { transform: 'translateX(3px)' },
          '60%': { transform: 'translateX(-2px)' },
          '70%': { transform: 'translateX(1px)' },
          '80%': { transform: 'translateX(0)' },
        },
        
      },
      animation: {
        typewriter: 'typewriter 3s steps(30, end) infinite, blink 0.75s step-end infinite',
        blink: 'blink 0.75s step-end infinite',
        glow: 'glow 1.8s ease-in-out infinite',
        shine: 'shine 1s ease-in-out forwards',
        shake: 'shake 0.5s ease-in-out 1',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-border': 'glow-border 4s ease-in-out infinite',
    'spin-slow': 'spin 20s linear infinite',
      },
    },
  },
  plugins: [textshadow],
};
