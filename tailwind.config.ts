import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#050507',
        ink: '#0b0b10',
        mist: '#e8e8ef',
        iris: {
          cyan: '#7ef9ff',
          violet: '#b98bff',
          rose: '#ff8bd6',
        },
      },
      fontFamily: {
        // --font-cjk (Noto Sans TC) slots in before the generic fallback so
        // zh text renders in a loaded font, not a system guess.
        display: ['var(--font-display)', 'var(--font-cjk)', 'sans-serif'],
        body: ['var(--font-body)', 'var(--font-cjk)', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
};

export default config;
