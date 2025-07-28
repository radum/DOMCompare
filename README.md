## Overview

DOMCompare is a browser extension that allows you to compare the raw HTML source received from the server with the final rendered DOM after JavaScript execution. This helps developers and testers identify changes made by client-side scripts, frameworks, or browser processing.

## Features

- **View Raw Source:** Easily access the original HTML as sent by the server.
- **View Rendered Source:** Inspect the live DOM after all scripts and styles have been applied.
- **Side-by-Side Comparison:** See differences between raw and rendered sources in a split view.
- **Highlight Changes:** Modified, added, or removed elements are visually highlighted.
- **Export Comparison:** Save or copy the comparison results for documentation or debugging.

## Installation

1. Download the extension from the [Chrome Web Store](TODO) or [Firefox Add-ons](TODO).
2. Click "Add to Browser" and follow the prompts.
3. Once installed, you’ll see the Rendered Source Comparator icon in your browser toolbar.

## Usage

1. Navigate to any webpage you want to inspect.
2. Click the extension icon.
3. The extension will display both the raw and rendered sources side by side.
4. Use the highlighting and export features as needed.

## Permissions

- Access to page content for comparison.
- No data is sent to external servers; all processing is done locally.

## License

This project is licensed under the MIT License.

## Development

```
git clone TODO
pnpm install
pnpm dev
```

Other extensions building frameworks

- https://github.com/wxt-dev/wxt (current used one)
- https://github.com/crxjs/chrome-extension-tools
- https://webext-core.aklinker1.io/messaging/installation

Diffing

- https://github.com/rtfpessoa/diff2html
- https://github.com/kpdecker/jsdiff
- https://github.com/google/diff-match-patch

Chrome debugger pages:

- chrome://serviceworker-internals/
- chrome://extensions/
