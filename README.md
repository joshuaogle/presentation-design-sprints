Reveal.js Template
==================

Born from personal best practices:

* Gulp for nonsense-free buildscripts
* Babel for writing JS2015 (aka ECMA 6) in 2015
* Browserify for code modularization
* Sass because CSS preprocessors are no big deal and Reveal.js uses that one (enabling us to reuse variables)

The paths of imported SASS and JS files aren’t pretty because Reveal.js isn’t intended as NPM module, but that’s the only problem.

Why?
----

Because the usage model of Reveal.js is bad. You are to fork and edit? How to deal with upsteam changes?

My way, everything stays separated: just bump the version of Reveal.js in package.json, do `npm update` and rebuild your file. Done.

How?
----

This thing isn’t going to change much, and mainly a starting point, unlike Reveal.js.

So just download a .tar.gz or .zip, as you’re not going to want to keep up with upstream changes (again, unlike Reveal.js).