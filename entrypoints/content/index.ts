import { ContentScriptContext } from '#imports';
import { onMessage } from '@/utils/messaging';

export default defineContentScript({
	// Set manifest options
	matches: ['\u003Call_urls>'],
	runAt: 'document_start',

	main(ctx: ContentScriptContext) {
		var DOMLoaded = false;

		document.addEventListener('DOMContentLoaded', function (event) {
			DOMLoaded = true;
		});

		onMessage('GET_HTML', () => {
			if (DOMLoaded) {
				// Get rendered DOM as string, turn it into an array, then a blob, then create an object URL of the blob which can be passed to background.js.
				var outerHTML = document.documentElement.outerHTML;

				var doctypeNode = document.doctype;

				var doctype = '';

				if (doctypeNode !== null) {
					doctype =
						'<!DOCTYPE ' +
						doctypeNode.name +
						(doctypeNode.publicId ? ' PUBLIC "' + doctypeNode.publicId + '"' : '') +
						(!doctypeNode.publicId && doctypeNode.systemId ? ' SYSTEM' : '') +
						(doctypeNode.systemId ? ' "' + doctypeNode.systemId + '"' : '') +
						'>';
				}

				var renderedDOMString = outerHTML;

				var renderedDomArray = [renderedDOMString];
				var renderedBlob = new Blob(renderedDomArray, { type: 'text/plain' });
				var renderedObjURL = URL.createObjectURL(renderedBlob);

				var userAgent = navigator.userAgent;

				return { payload: renderedObjURL, doctype: doctype, userAgent: userAgent };
			}
		});
	}
});
