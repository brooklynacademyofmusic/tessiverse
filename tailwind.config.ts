import { fontFamily } from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: ["./src/**/*.{html,js,svelte,ts}"],
	safelist: ["dark"],
	plugins: [
		require('@tailwindcss/typography'),
	  ],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px"
			}
		},
		extend: {
			colors: {
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				primary: {
					DEFAULT: "hsl(var(--primary) / <alpha-value>)",
					foreground: "hsl(var(--primary-foreground) / <alpha-value>)"
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
					foreground: "hsl(var(--secondary-foreground) / <alpha-value>)"
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
					foreground: "hsl(var(--destructive-foreground) / <alpha-value>)"
				},
				muted: {
					DEFAULT: "hsl(var(--muted) / <alpha-value>)",
					foreground: "hsl(var(--muted-foreground) / <alpha-value>)"
				},
				accent: {
					DEFAULT: "hsl(var(--accent) / <alpha-value>)",
					foreground: "hsl(var(--accent-foreground) / <alpha-value>)"
				},
				popover: {
					DEFAULT: "hsl(var(--popover) / <alpha-value>)",
					foreground: "hsl(var(--popover-foreground) / <alpha-value>)"
				},
				card: {
					DEFAULT: "hsl(var(--card) / <alpha-value>)",
					foreground: "hsl(var(--card-foreground) / <alpha-value>)"
				}
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)"
			},
			boxShadow: {
				'xl': "0 0 25px -4px",
				'2xl': "0 0 30px -8px", 
				'3xl': "0 0 40px -15px"
			},
			fontFamily: {
				sans: [...fontFamily.sans]
			},
			typography: ({ theme }) => ({
				default: {
				  css: {
					'--tw-prose-body': 'hsl(var(--primary-foreground))',
					'--tw-prose-headings': 'hsl(var(--primary-foreground))',
					'--tw-prose-lead': 'hsl(var(--primary-foreground))',
					'--tw-prose-links': 'hsl(var(--primary))',
					'--tw-prose-bold': 'hsl(var(--primary))',
					'--tw-prose-counters': 'hsl(var(--primary))',
					'--tw-prose-bullets': 'hsl(var(--primary))',
					'--tw-prose-hr': 'hsl(var(--secondary))',
					'--tw-prose-quotes': 'hsl(var(--secondary-foreground))',
					'--tw-prose-quote-borders': 'hsl(var(--secondary))',
					'--tw-prose-captions': 'hsl(var(--secondary-foreground))',
					'--tw-prose-code': 'hsl(var(--secondary-foreground))',
					'--tw-prose-pre-code': 'hsl(var(--secondary-foreground))',
					'--tw-prose-pre-bg': 'hsl(var(--secondary-background))',
					'--tw-prose-th-borders': 'hsl(var(--secondary))',
					'--tw-prose-td-borders': 'hsl(var(--secondary))',
				  },
				},
			  }),
		},
		
	},
};

export default config;
