import head   from 'reveal.js/lib/js/head.min'
import Reveal from 'reveal.js/js/reveal'

var prefix = 'node_modules/reveal.js'

document.addEventListener("DOMContentLoaded", (event) => {
	window.Reveal = Reveal // plugins need that
	
	// see: https://github.com/hakimel/reveal.js#configuration 
	Reveal.initialize({
		controls: true,
		progress: true,
		history: true,
		center: true,
		transition: 'slide', // none/fade/slide/convex/concave/zoom
		// Optional reveal.js plugins
		dependencies: [
			{ src: `${prefix}/lib/js/classList.js`, condition: function() { return !document.body.classList; } },
			{ src: `${prefix}/plugin/markdown/marked.js`, condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			{ src: `${prefix}/plugin/markdown/markdown.js`, condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			{ src: `${prefix}/plugin/highlight/highlight.js`, async: true, condition: function() { return !!document.querySelector( 'pre code' ); }, callback: function() { hljs.initHighlightingOnLoad(); } },
			{ src: `${prefix}/plugin/zoom-js/zoom.js`, async: true },
			{ src: `${prefix}/plugin/notes/notes.js`, async: true }
		]
	})
	
	// insert code here
})