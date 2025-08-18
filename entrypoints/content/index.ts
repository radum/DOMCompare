import type { ContentScriptContext } from '#imports';
import { onMessage } from '@/utils/messaging';

export default defineContentScript({
	// Set manifest options
	matches: ['\u003Call_urls>'],
	runAt: 'document_start',

	main(ctx: ContentScriptContext) {
		let DOMLoaded = false;

		document.addEventListener('DOMContentLoaded', () => {
			DOMLoaded = true;
		});

		onMessage('GET_HTML', () => {
			if (DOMLoaded) {
				// Get rendered DOM as string, turn it into an array, then a blob, then create an object URL of the blob which can be passed to background.js.
				const outerHTML = document.documentElement.outerHTML;
				const doctypeNode = document.doctype;
				let doctype = '';

				if (doctypeNode !== null) {
					doctype =
						`<!DOCTYPE ${
							doctypeNode.name
						}${doctypeNode.publicId ? ` PUBLIC "${doctypeNode.publicId}"` : ''
						}${!doctypeNode.publicId && doctypeNode.systemId ? ' SYSTEM' : ''
						}${doctypeNode.systemId ? ` "${doctypeNode.systemId}"` : ''
						}>`;
				}

				const renderedDOMString = outerHTML;

				const renderedDomArray = [renderedDOMString];
				const renderedBlob = new Blob(renderedDomArray, { type: 'text/plain' });
				const renderedObjURL = URL.createObjectURL(renderedBlob);

				const userAgent = navigator.userAgent;

				return { payload: renderedObjURL, doctype, userAgent };
			}
		});
	}
});
