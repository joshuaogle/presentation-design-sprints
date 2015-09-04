(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** loads the PDF print stylesheet if ?print-pdf is appended to the URL */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = loadPrintCSS;

function loadPrintCSS() {
	var cssPrefix = 'node_modules/reveal.js/css/print';

	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = cssPrefix + '/' + (window.location.search.match(/print-pdf/gi) ? 'pdf' : 'paper') + '.css';
	document.getElementsByTagName('head')[0].appendChild(link);
}

module.exports = exports['default'];

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvc291cmNlL2phdmFzY3JpcHRzL2Zha2VfNTExMzE3ZDIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7cUJDQ3dCLFlBQVk7O0FBQXJCLFNBQVMsWUFBWSxHQUFHO0FBQ3RDLEtBQU0sU0FBUyxHQUFHLGtDQUFrQyxDQUFBOztBQUVwRCxLQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3pDLEtBQUksQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFBO0FBQ3ZCLEtBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFBO0FBQ3RCLEtBQUksQ0FBQyxJQUFJLEdBQU0sU0FBUyxVQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBRSxhQUFhLENBQUUsR0FBRyxLQUFLLEdBQUcsT0FBTyxDQUFBLFNBQU0sQ0FBQTtBQUNqRyxTQUFRLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO0NBQzFEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKiBsb2FkcyB0aGUgUERGIHByaW50IHN0eWxlc2hlZXQgaWYgP3ByaW50LXBkZiBpcyBhcHBlbmRlZCB0byB0aGUgVVJMICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsb2FkUHJpbnRDU1MoKSB7XG5cdGNvbnN0IGNzc1ByZWZpeCA9ICdub2RlX21vZHVsZXMvcmV2ZWFsLmpzL2Nzcy9wcmludCdcblx0XG5cdGxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpXG5cdGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnXG5cdGxpbmsudHlwZSA9ICd0ZXh0L2Nzcydcblx0bGluay5ocmVmID0gYCR7Y3NzUHJlZml4fS8ke3dpbmRvdy5sb2NhdGlvbi5zZWFyY2gubWF0Y2goIC9wcmludC1wZGYvZ2kgKSA/ICdwZGYnIDogJ3BhcGVyJ30uY3NzYFxuXHRkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKGxpbmspXG59Il19
