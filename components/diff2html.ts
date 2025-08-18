import type { GlobalConfiguration } from '@dprint/formatter';
import type { Diff2HtmlUIConfig } from 'diff2html/lib/ui/js/diff2html-ui-slim.js';
import { createStreaming } from '@dprint/formatter';
import { storage } from '@wxt-dev/storage';
import { createTwoFilesPatch } from 'diff';
import { defaultDiff2HtmlUIConfig, Diff2HtmlUI } from 'diff2html/lib/ui/js/diff2html-ui-slim.js';
import { browser } from 'wxt/browser';
import { RENDERED_OBJURL_KEY_PREFIX } from '@/utils/constants';
// import * as Diff2Html from 'diff2html';

let renderedSourceHTML: string;
let rawSourceHTML: string;

function drawDiff2HTML(diffString: string, config: Diff2HtmlUIConfig, elements: any): void {
	const diff2htmlUi = new Diff2HtmlUI(elements.structure.diffTarget, diffString, config);

	diff2htmlUi.draw();

	// TODO: Not sure if this is better.
	// const diffHTML = Diff2Html.html(diffString, { drawFileList: false, matching: 'words', diffStyle: 'word', outputFormat: 'side-by-side' });
	// document.getElementById('diff-container').innerHTML = diffHTML;
}

let htmlFormatter: Awaited<ReturnType<typeof createStreaming>> | null = null;
async function getHtmlFormatter() {
	if (htmlFormatter) {
		return htmlFormatter;
	}
	const globalConfig: GlobalConfiguration = {
		lineWidth: 160
	};
	htmlFormatter = await createStreaming(
		fetch('https://plugins.dprint.dev/g-plane/markup_fmt-v0.23.1.wasm')
	);

	htmlFormatter.setConfig(globalConfig, {
		useTabs: true,
		quotes: 'double',
		formatComments: false,
		scriptIndent: false,
		styleIndent: false,
		closingBracketSameLine: false,
		closingTagLineBreakForEmpty: 'fit',
		preferAttrsSingleLine: false,
		singleAttrSameLine: true,
		whitespaceSensitivity: 'css',
		doctypeKeywordCase: 'upper'
	});
	return htmlFormatter;
}

function loadDiff2HTML(diff: string) {
	// This is assigned again as it could change if pretty printing is applied
	let diffString = diff;

	const diff2HTMLConfig: Diff2HtmlUIConfig = {
		...defaultDiff2HtmlUIConfig,
		drawFileList: false,
		matching: 'none',
		diffStyle: 'word',
		outputFormat: 'side-by-side'
	};

	const elements = { structure: { diffTarget: document.getElementById('diff-container') } };

	drawDiff2HTML(
		diffString,
		diff2HTMLConfig,
		elements
	);

	const btnLayoutSideBySide = document.getElementById('btn__layout-side-by-side');
	const btnLayoutStacked = document.getElementById('btn__layout-stacked');
	const btnPrettyPrint = document.getElementById('btn__pretty-print');

	btnLayoutSideBySide!.addEventListener('click', () => {
		diff2HTMLConfig.outputFormat = 'side-by-side';
		drawDiff2HTML(diffString, diff2HTMLConfig, elements);
		btnLayoutSideBySide!.classList.add('is-active');
		btnLayoutStacked!.classList.remove('is-active');
	});

	btnLayoutStacked!.addEventListener('click', () => {
		diff2HTMLConfig.outputFormat = 'line-by-line';
		drawDiff2HTML(diffString, diff2HTMLConfig, elements);
		btnLayoutSideBySide!.classList.remove('is-active');
		btnLayoutStacked!.classList.add('is-active');
	});

	btnPrettyPrint!.addEventListener('click', async () => {
		const formatter = await getHtmlFormatter();
		const isPretty = btnPrettyPrint!.classList.contains('is-active');

		let newRawSource = rawSourceHTML;
		let newRenderedSource = renderedSourceHTML;

		if (!isPretty) {
			newRawSource = formatter.formatText({
				filePath: 'raw.html',
				fileText: rawSourceHTML
			});
			newRenderedSource = formatter.formatText({
				filePath: 'rendered.html',
				fileText: renderedSourceHTML
			});
			btnPrettyPrint!.classList.add('is-active');
		}
		else {
			btnPrettyPrint!.classList.remove('is-active');
		}

		diffString = createTwoFilesPatch('raw.html', 'rendered.html', newRawSource, newRenderedSource);
		drawDiff2HTML(diffString, diff2HTMLConfig, elements);
	});
}

function initToolBarControls() {
	const btnShowAll = document.getElementById('btn__show-all');
	const btnShowOriginal = document.getElementById('btn__show-original');
	const btnShowRendered = document.getElementById('btn__show-rendered');
	const btnShowDiff = document.getElementById('btn__show-diff');

	const originalSourcePanel = document.getElementById('original-source-panel');
	const renderedSourcePanel = document.getElementById('rendered-source-panel');
	const diffPanel = document.getElementById('diff-panel');

	btnShowAll!.addEventListener('click', () => {
		btnShowAll?.classList.add('is-active');
		btnShowOriginal?.classList.remove('is-active');
		btnShowRendered?.classList.remove('is-active');
		btnShowDiff?.classList.remove('is-active');
		originalSourcePanel!.classList.remove('hidden');
		renderedSourcePanel!.classList.remove('hidden');
		diffPanel!.classList.remove('hidden');
	});

	btnShowOriginal!.addEventListener('click', () => {
		btnShowAll?.classList.remove('is-active');
		btnShowOriginal?.classList.add('is-active');
		btnShowRendered?.classList.remove('is-active');
		btnShowDiff?.classList.remove('is-active');
		originalSourcePanel!.classList.remove('hidden');
		renderedSourcePanel!.classList.add('hidden');
		diffPanel!.classList.add('hidden');
	});

	btnShowRendered!.addEventListener('click', () => {
		btnShowAll?.classList.remove('is-active');
		btnShowOriginal?.classList.remove('is-active');
		btnShowRendered?.classList.add('is-active');
		btnShowDiff?.classList.remove('is-active');
		originalSourcePanel!.classList.add('hidden');
		renderedSourcePanel!.classList.remove('hidden');
		diffPanel!.classList.add('hidden');
	});

	btnShowDiff!.addEventListener('click', () => {
		btnShowAll?.classList.remove('is-active');
		btnShowOriginal?.classList.remove('is-active');
		btnShowRendered?.classList.remove('is-active');
		btnShowDiff?.classList.add('is-active');
		originalSourcePanel!.classList.add('hidden');
		renderedSourcePanel!.classList.add('hidden');
		diffPanel!.classList.remove('hidden');
	});
}

// MAIN FUNCTION
export async function initDiff2HTML() {
	// get tabID from URL parameter
	const thisURL = new URL(window.location.href);
	const tabID = thisURL.searchParams.get('tabID');

	console.log('thisURL', thisURL);
	console.log('tabID', tabID);

	const renderedObjKey = RENDERED_OBJURL_KEY_PREFIX + tabID;
	// const doctypeKey = DOCTYPE_KEY_PREFIX + tabID;
	// const uaKey = UA_KEY_PREFIX + tabID;

	const renderedSourceURL: string | null = await storage.getItem(`local:${renderedObjKey}`);

	if (!tabID || !renderedSourceURL) {
		console.error('No tabID or rendered source URL found');
		return;
	}

	browser.tabs.get(Number.parseInt(tabID, 10), async (tab) => {
		renderedSourceHTML = await fetchHTMLSource(renderedSourceURL);
		rawSourceHTML = await fetchHTMLSource(tab.url as string);

		document.getElementById('analyzing-status-element')!.textContent = tab.url || 'Unknown URL';

		const diff = createTwoFilesPatch('raw.html', 'rendered.html', rawSourceHTML, renderedSourceHTML);
		addSourcesToUI(rawSourceHTML, renderedSourceHTML);
		loadDiff2HTML(diff);
		initToolBarControls();
	});
}

/**
 * Updates the UI sections with rendered source containers with the provided HTML.
 *
 * @param raw - The raw source string to display in the 'original-source-container' element.
 * @param rendered - The rendered source string to display in the 'rendered-source-container' element.
 */
function addSourcesToUI(raw: string, rendered: string) {
	const originalContainer = document.getElementById('original-source-container');

	if (originalContainer) {
		originalContainer.textContent = raw;
	}

	const renderedContainer = document.getElementById('rendered-source-container');

	if (renderedContainer) {
		renderedContainer.textContent = rendered;
	}
}

/**
 * Fetches the HTML source from the specified URL.
 *
 * Makes an HTTP GET request to the provided URL and returns the response body as a string.
 * Throws an error if the response status is not OK (status code outside the 200-299 range).
 *
 * @param url - The URL from which to fetch the HTML source.
 * @returns A promise that resolves to the HTML source as a string.
 * @throws {Error} If the HTTP response status is not OK.
 */
async function fetchHTMLSource(url: string) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			const errorMsg = `HTTP error! status: ${response.status} - ${response.statusText}`;
			showFetchError(errorMsg);
			throw new Error(errorMsg);
		}
		return await response.text();
	} catch (err: any) {
		showFetchError(err?.message || String(err));
		throw err;
	}
}

function showFetchError(message: string) {
	const statusEl = document.getElementById('analyzing-status-element');
	if (statusEl) {
		statusEl.textContent = `Error loading HTML: ${message}`;
	}
}
