Reveal.js Template
==================

Born from personal best practices:

* [Gulp](http://gulpjs.com/) for nonsense-free buildscripts
* [Babel](https://babeljs.io/) for writing JS2015 (aka ECMA 6) in 2015
* [Browserify](http://browserify.org/) for code modularization
* [Sass](http://sass-lang.com/) because CSS preprocessors are no big deal and Reveal.js uses that one (enabling us to reuse variables)

The paths of imported SASS and JS files aren’t pretty because Reveal.js isn’t intended as NPM module, but that’s the only problem.

Why?
----

Because the usage model of Reveal.js is bad. You are to fork and edit? How to deal with upsteam changes?

My way, everything stays separated: just bump the version of Reveal.js in package.json, do `npm update` and rebuild your file. Done.

How?
----

This thing isn’t going to change much, and mainly a starting point, unlike Reveal.js.

So just download a .tar.gz or .zip, as you’re not going to want to keep up with upstream changes (again, unlike Reveal.js).

Then extract it to somewhere, go there, and…

```console
$ # Install deps
$ npm install
$ # Do an initial build
$ gulp build
$ # Launch the dev server
$ gulp
```

Look at what the output tells you: There will a server be running (usually on http://localhost:8888) with your presentation. Any changes to the source files will trigger a reload of the presentation (you’ll stay on the current slide of course).

More features!
--------------

1. Use JS2015/ECMA6 with polyfills (iterators! array functions! `Promise`! stuff!)
2. Use the [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch) API for `Promise`-based requests
3. Start hassle-free with a [LiveReload](http://livereload.com/) and [Autoprefixer](https://github.com/postcss/autoprefixer#autoprefixer-) enabled Gulpfile. Just run `gulp` and every time you save HTML, JS or SCSS files, your presentation reloads with the changes
4. Two small extensions:

		* Append `?print-pdf` to the URL to be able to [convert it to PDF via Chrome](https://github.com/hakimel/reveal.js#pdf-export)
		* Use `<svg data-src="...svg"></svg>` to load a SVG containing `class="fragment"` elements or to style SVG elements with CSS
