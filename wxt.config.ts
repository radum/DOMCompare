import UnoCSS from 'unocss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		manifest_version: 3,
		// storage is needed for setting the fetched HTML, tabs is needed to access the tab url
		permissions: ['storage', 'tabs'],
		content_security_policy: {
			// eslint-disable-next-line style/quotes
			extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
		},
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
