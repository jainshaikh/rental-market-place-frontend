import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // 4321-Drive design system — brand + neutral + frozen status tones.
        // Fixed hex (not HSL-var indirection) so they match Design System.dc.html verbatim.
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
        },
        ink: '#0F172A',
        page: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-hover': '#F1F5F9',
        'border-subtle': '#E2E8F0',
        'border-strong': '#CBD5E1',
        'text-muted': '#64748B',
        'text-faint': '#94A3B8',
        whatsapp: {
          DEFAULT: '#25D366',
          hover: '#1FB855',
        },
        status: {
          amber: { fg: '#92400E', bg: '#FFFBEB', border: '#FDE68A', dot: '#D97706' },
          blue: { fg: '#1E3A8A', bg: '#EFF6FF', border: '#BFDBFE', dot: '#2563EB' },
          emerald: { fg: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', dot: '#059669' },
          red: { fg: '#991B1B', bg: '#FEF2F2', border: '#FECACA', dot: '#DC2626' },
          slate: { fg: '#334155', bg: '#F8FAFC', border: '#E2E8F0', dot: '#64748B' },
          violet: { fg: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE', dot: '#7C3AED' },
          teal: { fg: '#115E59', bg: '#F0FDFA', border: '#99F6E4', dot: '#0D9488' },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        chip: '6px',
        control: '8px',
        media: '10px',
        card: '14px',
        sheet: '20px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(15,23,42,0.04)',
        sm: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        md: '0 4px 14px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.04)',
        lg: '0 16px 40px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.05)',
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
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-480px 0' },
          '100%': { backgroundPosition: '480px 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
