/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./client/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#090a0f',
          surface: '#10121b',
          card: '#161926',
          border: '#24293e',
          cyan: '#00f3ff',
          pink: '#ff007f',
          purple: '#7000ff',
          green: '#00ff66',
          yellow: '#ffaa00',
          red: '#ff3366',
          dim: '#8f9bb3'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        sans: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 243, 255, 0.4)',
        'glow-pink': '0 0 15px rgba(255, 0, 127, 0.4)',
        'glow-purple': '0 0 15px rgba(112, 0, 255, 0.4)',
        'glow-gold': '0 0 15px rgba(255, 170, 0, 0.4)',
        'glow-green': '0 0 15px rgba(0, 255, 102, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 243, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 243, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
