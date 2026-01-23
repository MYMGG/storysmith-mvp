// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#fdf6e3',
          deep: '#f0e6d2',
        },
        'parchment-deep': '#f0e6d2',
        ink: {
          DEFAULT: '#2b2b2b',
          light: '#4a4a4a',
        },
        gold: {
          DEFAULT: '#c5a059',
          dim: '#a68442',
        },
        leather: {
          DEFAULT: '#5d4037',
          dark: '#3e2723',
        },
        'accent-primary': '#c5a059',
        'accent-secondary': '#5d4037',
      },
      fontFamily: {
        heading: ['Cinzel', 'serif'],
        body: ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
};
