import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ProcureAI Brand Colors
        primary: '#0F766E',        // Deep teal green
        'primary-dark': '#0D5F5A', // Darker teal
        'primary-light': '#14B8A6', // Light teal
        accent: '#4ECDC4',         // Mint accent
        'accent-light': '#7EE8DD', // Light mint
        
        // Sidebar
        sidebar: '#1F2937',        // Dark gray
        'sidebar-hover': '#374151', // Medium gray
        
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        'error-light': '#FEE2E2',
      },
      boxShadow: {
        xs: '0 0px 1px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.12)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      },
      backgroundImage: {
        'gradient-ai': 'linear-gradient(135deg, #14B8A6 0%, #4ECDC4 100%)',
        'gradient-subtle': 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(78, 205, 196, 0.05) 100%)',
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  plugins: [],
}

export default config
