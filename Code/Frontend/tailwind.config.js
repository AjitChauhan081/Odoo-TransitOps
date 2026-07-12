/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  safelist: [
    'bg-status-available', 'bg-status-warn', 'bg-status-danger', 'bg-status-neutral',
    'text-status-available', 'text-status-warn', 'text-status-danger', 'text-status-neutral',
    'border-status-available', 'border-status-warn', 'border-status-danger', 'border-status-neutral',
    'border-ink-soft', 'text-ink-soft',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif 4"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        'paper-dim': 'var(--paper-dim)',
        accent: 'var(--accent)',
        'status-available': 'var(--status-available)',
        'status-warn': 'var(--status-warn)',
        'status-danger': 'var(--status-danger)',
        'status-neutral': 'var(--status-neutral)',
      },
      spacing: {
        1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px',
        6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px',
      },
      borderRadius: { none: '0px', sm: '2px', DEFAULT: '2px' },
    },
  },
  plugins: [],
}
