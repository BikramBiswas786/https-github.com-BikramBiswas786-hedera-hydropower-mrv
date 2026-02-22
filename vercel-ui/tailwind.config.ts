import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-green-400',
    'bg-red-400',
    'text-green-400',
    'text-red-400',
    'from-green-500/20',
    'to-green-600/20',
    'border-green-500/30',
    'text-blue-400',
    'from-blue-500/20',
    'to-blue-600/20',
    'border-blue-500/30',
    'text-purple-400',
    'from-purple-500/20',
    'to-purple-600/20',
    'border-purple-500/30',
    'text-yellow-400',
    'from-yellow-500/20',
    'to-yellow-600/20',
    'border-yellow-500/30',
  ],
}
export default config
