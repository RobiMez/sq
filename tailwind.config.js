/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		fontFamily: {
			sans: ['Lexend', 'sans-serif']
		}
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: [
			{
				light: {
					...require("daisyui/src/theming/themes")["light"],
					primary: "#d7be9f",
					secondary: "#4c484f",
					accent: "#f3f4f6",
					neutral: "#f3f4f6",
					base: "#f3f4f6",
				},
			},
		],
	},
};
