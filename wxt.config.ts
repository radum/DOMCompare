import { defineConfig } from "wxt";
import UnoCSS from "unocss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		permissions: ["storage"],
		action: {},
	},
	vite: () => ({
		plugins: [UnoCSS()],
	}),
	webExt: {
		startUrls: ["https://www.example.com"],
	},
});
