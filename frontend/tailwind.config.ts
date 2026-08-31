import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Green Aesthetic Palette
        forest: {
          DEFAULT: '#173F32',
          dark: '#0F2C23',
          light: '#245646',
          muted: '#527968',
        },
        sage: {
          DEFAULT: '#BFD8CC',
          light: '#D5E6DE',
        },
        mint: {
          DEFAULT: '#DCEDE5',
          light: '#EDF5F1',
          surface: '#F4F9F6',
        },
        canvas: '#F7F7F2',
        bodyText: '#16231F',
        mutedText: '#63736D',
        subtleBorder: '#DCE3DF',
        
        // Primary alias mapped to Forest Green
        primary: {
          DEFAULT: '#173F32',
          hover: '#245646',
          light: '#DCEDE5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(23, 63, 50, 0.05), 0 1px 2px 0 rgba(23, 63, 50, 0.03)',
        card: '0 4px 16px -2px rgba(23, 63, 50, 0.06), 0 2px 4px -1px rgba(23, 63, 50, 0.03)',
        floating: '0 12px 32px -4px rgba(23, 63, 50, 0.12), 0 4px 12px -2px rgba(23, 63, 50, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
