import { storage } from '@wxt-dev/storage';
import { browser } from 'wxt/browser';
import { DOCTYPE_KEY_PREFIX, RENDERED_OBJURL_KEY_PREFIX, UA_KEY_PREFIX } from '@/utils/constants';
import { sendMessage } from '@/utils/messaging';

function initDOMCompare() {
	browser.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
		// Get current tab position so we can open new tab next to it
		const tabPosition = tabs[0].index;
		const tabID = tabs[0].id;

		const tabHTMLBlob = await sendMessage('GET_HTML', undefined, tabID);

		const renderedObjURL = tabHTMLBlob.payload;
		const renderedObjKey = RENDERED_OBJURL_KEY_PREFIX + tabs[0].id;
		const doctypeKey = DOCTYPE_KEY_PREFIX + tabs[0].id;
		const uaKey = UA_KEY_PREFIX + tabs[0].id;

		storage.setItem(`local:${renderedObjKey}`, renderedObjURL);
		storage.setItem(`local:${doctypeKey}`, tabHTMLBlob.doctype);
		storage.setItem(`local:${uaKey}`, tabHTMLBlob.userAgent);

		browser.tabs.create({ url: `ui.html?tabID=${tabID}`, index: tabPosition + 1 });
	});
}

export default defineBackground(() => {
	browser.runtime.getURL('/ui.html'); // TODO: Do we need this?
	browser.action.onClicked.addListener(() => {
		initDOMCompare();
	});
});
