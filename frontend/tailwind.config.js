/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // OpenClaw - Crab Color Palette
        'claw-black': '#0d0a09',
        'claw-dark': '#1c1410',
        'claw-green': '#FF6B35',        // Crab Orange - primary
        'claw-green-dim': '#E85A2A',
        'claw-orange': '#FF4500',       // Deep Orange - accent
        'claw-orange-dim': '#cc3700',
        'claw-red': '#DC2626',          // Crab Red - danger
        'claw-coral': '#FF7F50',        // Coral
        'claw-shell': '#CD5C5C',        // Indian Red (shell)
        'claw-sand': '#F4A460',         // Sandy Brown
        'claw-border': '#2d1f1a',
        'claw-border-light': '#3d2a22',
        'claw-text': '#fef2e8',
        'claw-text-dim': '#a89080',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'none': '0px',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #2d1f1a',
        'brutal-green': '4px 4px 0px 0px #FF6B35',
        'brutal-orange': '4px 4px 0px 0px #FF4500',
        'brutal-coral': '4px 4px 0px 0px #FF7F50',
        'glow-crab': '0 0 20px rgba(255, 107, 53, 0.4)',
        'glow-coral': '0 0 20px rgba(255, 127, 80, 0.3)',
      },
      animation: {
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { clipPath: 'inset(0 0 0 0)' },
          '20%': { clipPath: 'inset(20% 0 60% 0)' },
          '40%': { clipPath: 'inset(40% 0 40% 0)' },
          '60%': { clipPath: 'inset(60% 0 20% 0)' },
          '80%': { clipPath: 'inset(80% 0 0% 0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      letterSpacing: {
        'brutal': '0.2em',
      },
    },
  },
  plugins: [],
}
