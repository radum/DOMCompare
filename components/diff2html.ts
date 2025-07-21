import { browser } from 'wxt/browser';
import { storage } from '@wxt-dev/storage';
import { createTwoFilesPatch } from 'diff';
import { Diff2HtmlUI, defaultDiff2HtmlUIConfig, Diff2HtmlUIConfig } from 'diff2html/lib/ui/js/diff2html-ui-slim.js';
import * as Diff2Html from 'diff2html';
import { RENDERED_OBJURL_KEY_PREFIX, DOCTYPE_KEY_PREFIX, UA_KEY_PREFIX } from '@/utils/constants';

function draw(diffString: string, config: Diff2HtmlUIConfig, elements: any): void {
	const diff2htmlUi = new Diff2HtmlUI(elements.structure.diffTarget, diffString, config);

	diff2htmlUi.draw();
}

export async function initDiff2HTML() {
	// get tabID from URL parameter
	var thisURL = new URL(window.location.href);
	var tabID = thisURL.searchParams.get('tabID');

	var renderedObjKey = RENDERED_OBJURL_KEY_PREFIX + tabID;
	var doctypeKey = DOCTYPE_KEY_PREFIX + tabID;
	var uaKey = UA_KEY_PREFIX + tabID;

	const renderedSourceURL: string | null = await storage.getItem(`local:${renderedObjKey}`);

	if (!tabID || !renderedSourceURL) {
		console.error('No tabID or rendered source URL found');
		return;
	}

	browser.tabs.get(parseInt(tabID, 10), async function (tab) {
		const renderedSourceHTML = await fetchHTMLSource(renderedSourceURL);
		const rawSourceHTML = await fetchHTMLSource(tab.url as string);

		const diff = createTwoFilesPatch('raw.html', 'rendered.html', rawSourceHTML, renderedSourceHTML);
		addSourcesToUI(rawSourceHTML, renderedSourceHTML);
		loadDiff2HTML(diff);
	});
}

function loadDiff2HTML(diffString: string) {
	draw(
		diffString,
		{ ...defaultDiff2HtmlUIConfig, drawFileList: false, matching: 'words', diffStyle: 'word', outputFormat: 'side-by-side' },
		{ structure: { diffTarget: document.getElementById('diff-container') } }
	);

	// const x = Diff2Html.html(diffString, { drawFileList: false, matching: 'words', diffStyle: 'word', outputFormat: 'side-by-side' });
	// document.getElementById('diff-container').innerHTML = x;
}

function addSourcesToUI(raw: string, rendered: string) {
	const originalContainer = document.getElementById('original-source-container');
	console.log('originalContainer');
	if (originalContainer) {
		originalContainer.innerText = raw;
	}
	const renderedContainer = document.getElementById('rendered-source-container');
	if (renderedContainer) {
		renderedContainer.innerText = rendered;
	}
}

async function fetchHTMLSource(url: string) {
	return fetch(url).then((response) => {
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.text();
	});
}
