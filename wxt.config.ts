import UnoCSS from 'unocss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		permissions: ['storage'],
		action: {}
	},
	vite: () => ({
		plugins: [UnoCSS()]
	}),
	webExt: {
		startUrls: ['https://www.example.com']
	},
	modules: ['@wxt-dev/auto-icons']
});
