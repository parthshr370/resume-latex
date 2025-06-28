import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
		"*.{js,ts,jsx,tsx,mdx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
			},
			fontFamily: {
				sans: ["var(--font-inter)", ...fontFamily.sans],
				latex: ["Computer Modern", "serif"],
			},
			borderRadius: {
				xl: "1rem",
				"2xl": "1.5rem",
				full: "9999px",
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			boxShadow: {
				"neo-white-sm": "4px 4px 0px 0px rgba(255,255,255,0.7)",
				"neo-white-md": "6px 6px 0px 0px rgba(255,255,255,0.7)",
				"neo-white-lg": "8px 8px 0px 0px rgba(255,255,255,1)",
				"neo-black-sm": "4px 4px 0px 0px rgba(0,0,0,0.5)",
				"neo-black-md": "6px 6px 0px 0px rgba(0,0,0,0.75)",
			},
			backgroundImage: {
				"cursor-hero-gradient":
					"radial-gradient(ellipse 80% 50% at 5% 20%, rgba(88, 3, 111, 0.6) 0%, transparent 80%), radial-gradient(ellipse 60% 40% at 90% 30%, rgba(215, 58, 141, 0.5) 0%, transparent 70%), radial-gradient(ellipse 70% 50% at 50% 85%, rgba(46, 137, 167, 0.5) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 75% 75%, rgba(60, 179, 113, 0.5) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 25% 85%, rgba(255, 140, 0, 0.4) 0%, transparent 70%)",
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
