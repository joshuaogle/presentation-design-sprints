(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = loadDataSrcSVG;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function replaceAttributes(new_, old) {
	for (var i = 0; i < old.attributes.length; i++) {
		var attr = old.attributes[i];
		new_.setAttribute(attr.name, attr.value);
	}
}

/** embed SVGs via data-src
 * e.g. <svg data-src="images/test.svg"></svg>.
 * Useful for styling and using class="fragment" in SVG code
 */

function loadDataSrcSVG() {
	var svgsToLoad = [].concat(_toConsumableArray(document.querySelectorAll('svg[data-src]')));

	var loadSVGs = svgsToLoad.map(function (svg) {
		return fetch(svg.getAttribute('data-src')).then(function (response) {
			return response.text();
		}).then(function (svgCode) {
			var svgDoc = new DOMParser().parseFromString(svgCode, 'image/svg+xml');
			var newSVG = svgDoc.documentElement;
			replaceAttributes(newSVG, svg);
			svg.parentNode.replaceChild(newSVG, svg);
		})['catch'](function (error) {
			if (!(error instanceof TypeError)) throw error;
			var img = document.createElement('img');
			img.setAttribute('src', svg.getAttribute('data-src'));
			replaceAttributes(img, svg);
			svg.parentNode.replaceChild(img, svg);
		});
	});

	Promise.all(loadSVGs).then(function (val) {
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = document.querySelectorAll('svg.stretch:not([preserveAspectRatio])')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var svg = _step.value;

				if (!svg.hasAttribute('viewBox')) {
					var w = svg.getAttribute('width');
					var h = svg.getAttribute('height');
					svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
				}
				svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator['return']) {
					_iterator['return']();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	});
}

module.exports = exports['default'];

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb3NodWFvZ2xlL1Byb2plY3RzL3ByZXNlbnRhdGlvbi10ZW1wbGF0ZS9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9zaHVhb2dsZS9Qcm9qZWN0cy9wcmVzZW50YXRpb24tdGVtcGxhdGUvc291cmNlL2phdmFzY3JpcHRzL2Zha2VfMTgwMzBiNWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztxQkNXd0IsY0FBYzs7OztBQVh0QyxTQUFTLGlCQUFpQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDckMsTUFBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNDLE1BQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDNUIsTUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtFQUN4QztDQUNEOzs7Ozs7O0FBTWMsU0FBUyxjQUFjLEdBQUc7QUFDeEMsS0FBSSxVQUFVLGdDQUFRLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFBOztBQUVsRSxLQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRztTQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQ3RFLElBQUksQ0FBQyxVQUFBLFFBQVE7VUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFO0dBQUEsQ0FBQyxDQUNqQyxJQUFJLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDaEIsT0FBSSxNQUFNLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFBO0FBQ3RFLE9BQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUE7QUFDbkMsb0JBQWlCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQzlCLE1BQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQTtHQUN4QyxDQUFDLFNBQ0ksQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUNmLE9BQUksRUFBRSxLQUFLLFlBQVksU0FBUyxDQUFBLEFBQUMsRUFDaEMsTUFBTSxLQUFLLENBQUE7QUFDWixPQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3ZDLE1BQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtBQUNyRCxvQkFBaUIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDM0IsTUFBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0dBQ3JDLENBQUM7RUFBQSxDQUFDLENBQUE7O0FBRUosUUFBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxHQUFHLEVBQUk7Ozs7OztBQUNqQyx3QkFBZ0IsUUFBUSxDQUFDLGdCQUFnQixDQUFDLHdDQUF3QyxDQUFDLDhIQUFFO1FBQTVFLEdBQUc7O0FBQ1gsUUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDakMsU0FBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNqQyxTQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ2xDLFFBQUcsQ0FBQyxZQUFZLENBQUMsU0FBUyxXQUFTLENBQUMsU0FBSSxDQUFDLENBQUcsQ0FBQTtLQUM1QztBQUNELE9BQUcsQ0FBQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsZUFBZSxDQUFDLENBQUE7SUFDeEQ7Ozs7Ozs7Ozs7Ozs7OztFQUNELENBQUMsQ0FBQTtDQUNGIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIHJlcGxhY2VBdHRyaWJ1dGVzKG5ld18sIG9sZCkge1xuXHRmb3IgKGxldCBpPTA7IGk8b2xkLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRsZXQgYXR0ciA9IG9sZC5hdHRyaWJ1dGVzW2ldXG5cdFx0bmV3Xy5zZXRBdHRyaWJ1dGUoYXR0ci5uYW1lLCBhdHRyLnZhbHVlKVxuXHR9XG59XG5cbi8qKiBlbWJlZCBTVkdzIHZpYSBkYXRhLXNyY1xuICogZS5nLiA8c3ZnIGRhdGEtc3JjPVwiaW1hZ2VzL3Rlc3Quc3ZnXCI+PC9zdmc+LlxuICogVXNlZnVsIGZvciBzdHlsaW5nIGFuZCB1c2luZyBjbGFzcz1cImZyYWdtZW50XCIgaW4gU1ZHIGNvZGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbG9hZERhdGFTcmNTVkcoKSB7XG5cdGxldCBzdmdzVG9Mb2FkID0gWyAuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzdmdbZGF0YS1zcmNdJykgXVxuXHRcblx0bGV0IGxvYWRTVkdzID0gc3Znc1RvTG9hZC5tYXAoc3ZnID0+IGZldGNoKHN2Zy5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJykpXG5cdFx0LnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UudGV4dCgpKVxuXHRcdC50aGVuKHN2Z0NvZGUgPT4ge1xuXHRcdFx0bGV0IHN2Z0RvYyA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoc3ZnQ29kZSwgJ2ltYWdlL3N2Zyt4bWwnKVxuXHRcdFx0bGV0IG5ld1NWRyA9IHN2Z0RvYy5kb2N1bWVudEVsZW1lbnRcblx0XHRcdHJlcGxhY2VBdHRyaWJ1dGVzKG5ld1NWRywgc3ZnKVxuXHRcdFx0c3ZnLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld1NWRywgc3ZnKVxuXHRcdH0pXG5cdFx0LmNhdGNoKGVycm9yID0+IHtcblx0XHRcdGlmICghKGVycm9yIGluc3RhbmNlb2YgVHlwZUVycm9yKSlcblx0XHRcdFx0dGhyb3cgZXJyb3Jcblx0XHRcdGxldCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKVxuXHRcdFx0aW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgc3ZnLmdldEF0dHJpYnV0ZSgnZGF0YS1zcmMnKSlcblx0XHRcdHJlcGxhY2VBdHRyaWJ1dGVzKGltZywgc3ZnKVxuXHRcdFx0c3ZnLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGltZywgc3ZnKVxuXHRcdH0pKVxuXHRcblx0UHJvbWlzZS5hbGwobG9hZFNWR3MpLnRoZW4odmFsID0+IHtcblx0XHRmb3IgKGxldCBzdmcgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc3ZnLnN0cmV0Y2g6bm90KFtwcmVzZXJ2ZUFzcGVjdFJhdGlvXSknKSkge1xuXHRcdFx0aWYgKCFzdmcuaGFzQXR0cmlidXRlKCd2aWV3Qm94JykpIHtcblx0XHRcdFx0bGV0IHcgPSBzdmcuZ2V0QXR0cmlidXRlKCd3aWR0aCcpXG5cdFx0XHRcdGxldCBoID0gc3ZnLmdldEF0dHJpYnV0ZSgnaGVpZ2h0Jylcblx0XHRcdFx0c3ZnLnNldEF0dHJpYnV0ZSgndmlld0JveCcsIGAwIDAgJHt3fSAke2h9YClcblx0XHRcdH1cblx0XHRcdHN2Zy5zZXRBdHRyaWJ1dGUoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCAneE1pZFlNaWQgbWVldCcpXG5cdFx0fVxuXHR9KVxufSJdfQ==
