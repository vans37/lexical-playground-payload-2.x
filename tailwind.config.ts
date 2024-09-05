import type { Config } from 'tailwindcss'

const config = {
  content: [
    //default values parse way too many files
    //and require too much ram when building next
      './src/components/**/*.{ts,tsx}',
      './src/app/**/*.{ts,tsx}',
  ],
  darkMode: ['class'],
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
  prefix: '',
  safelist: [
    {
      pattern: /bg-/,
    },
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsl(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      // typography: {
      //   DEFAULT: {
      //     css: {
      //       figure: {
      //         display: 'inline-block',
      //         margin: "0.5rem 0.5rem 0.5rem 0"
      //       },
      //       img: {
      //         display: 'inline-block',
      //         margin: "0.5rem 0.5rem 0.5rem 0"
      //       },

      //       table: {
      //         borderCollapse: 'collapse',
      //         borderSpacing: '0',
      //         display: 'block',
      //         margin: '30px 0',
      //         overflowX: 'auto',
      //         tableLayout: 'fixed',
      //         width: 'max-content',
      //       },
      //       td: {
      //         border: '1px solid #bbb',

      //         outline: 'none',
      //         padding: '6px 8px',

      //       },
      //       th: {
      //         border: '1px solid #bbb',
      //         padding: '0.5rem',
      //       },
      //     },
      //   },
      // },
    },
  },
} satisfies Config

export default config
