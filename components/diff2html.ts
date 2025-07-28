import type { Diff2HtmlUIConfig } from 'diff2html/lib/ui/js/diff2html-ui-slim.js';
import { storage } from '@wxt-dev/storage';
import { createTwoFilesPatch } from 'diff';
import { defaultDiff2HtmlUIConfig, Diff2HtmlUI } from 'diff2html/lib/ui/js/diff2html-ui-slim.js';
import { browser } from 'wxt/browser';
import { DOCTYPE_KEY_PREFIX, RENDERED_OBJURL_KEY_PREFIX, UA_KEY_PREFIX } from '@/utils/constants';
// import * as Diff2Html from 'diff2html';

function drawDiff2HTML(diffString: string, config: Diff2HtmlUIConfig, elements: any): void {
	const diff2htmlUi = new Diff2HtmlUI(elements.structure.diffTarget, diffString, config);

	diff2htmlUi.draw();

	// TODO: Not sure if this is better.
	// const diffHTML = Diff2Html.html(diffString, { drawFileList: false, matching: 'words', diffStyle: 'word', outputFormat: 'side-by-side' });
	// document.getElementById('diff-container').innerHTML = diffHTML;
}

function loadDiff2HTML(diffString: string) {
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

export async function initDiff2HTML() {
	// get tabID from URL parameter
	const thisURL = new URL(window.location.href);
	const tabID = thisURL.searchParams.get('tabID');

	const renderedObjKey = RENDERED_OBJURL_KEY_PREFIX + tabID;
	// const doctypeKey = DOCTYPE_KEY_PREFIX + tabID;
	// const uaKey = UA_KEY_PREFIX + tabID;

	const renderedSourceURL: string | null = await storage.getItem(`local:${renderedObjKey}`);

	if (!tabID || !renderedSourceURL) {
		console.error('No tabID or rendered source URL found');
		return;
	}

	browser.tabs.get(Number.parseInt(tabID, 10), async (tab) => {
		const renderedSourceHTML = await fetchHTMLSource(renderedSourceURL);
		const rawSourceHTML = await fetchHTMLSource(tab.url as string);

		document.getElementById('analyzing-status-element')!.textContent = tab.url || 'Unknown URL';

		const diff = createTwoFilesPatch('raw.html', 'rendered.html', rawSourceHTML, renderedSourceHTML);
		addSourcesToUI(rawSourceHTML, renderedSourceHTML);
		loadDiff2HTML(diff);
		initToolBarControls();
	});
}

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

async function fetchHTMLSource(url: string) {
	return fetch(url).then((response) => {
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.text();
	});
}
