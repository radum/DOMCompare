import { defineConfig } from "unocss";
import presetWind4 from "@unocss/preset-wind4";

export default defineConfig({
	content: {
		filesystem: ["**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}"],
	},
	presets: [
		presetWind4({
			preflights: {
				reset: true,
			},
		}),
	],
});
