import 'babel-core/polyfill'
import 'whatwg-fetch'

import head   from 'reveal.js/lib/js/head.min'
import Reveal from 'reveal.js/js/reveal'

import loadDataSrcSVG from './svg'
import loadPrintCSS   from './print'

var prefix = 'node_modules/reveal.js/plugin'

document.addEventListener('DOMContentLoaded', (event) => {
	window.Reveal = Reveal
	Reveal.initialize({
		progress: true,
		history: true,
		center: true,
		transition: 'slide',
		dependencies: [
			{ src: `${prefix}/markdown/marked.js`, condition: () => !!document.querySelector('[data-markdown]') },
			{ src: `${prefix}/markdown/markdown.js`, condition: () => !!document.querySelector('[data-markdown]') },
			{ src: `${prefix}/highlight/highlight.js`, async: true, condition: () => !!document.querySelector('pre code'), callback: () => hljs.initHighlightingOnLoad() },
			{ src: `${prefix}/zoom-js/zoom.js`, async: true },
			{ src: `${prefix}/notes/notes.js`, async: true },
			{ src: `${prefix}/math/math.js`, async: true },
		],
	})

	loadDataSrcSVG()
	loadPrintCSS()
})
