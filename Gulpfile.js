var autoprefixer = require("gulp-autoprefixer")
var browserify   = require("gulp-browserify")
var concat			 = require("gulp-concat")
var connect      = require("gulp-connect")
var gulp         = require("gulp")
var haml		     = require("gulp-haml")
var plumber      = require("gulp-plumber")
var sass         = require("gulp-sass")

var paths = {
	assets: "assets",
	fonts: "source/fonts/*.*",
	haml: "source/templates/index.haml",
	js: "source/javascripts/**/*.js",
	root: "./",
	scss: "source/stylesheets/slides.scss"
}

gulp.task("js", function() {
	return gulp.src(paths.js)
		.pipe(plumber())
		.pipe(browserify({
			transform: ["babelify"],
			debug: true,
		}))
		.pipe(gulp.dest(paths.assets))
		.pipe(connect.reload())
})

gulp.task("sass", function() {
	return gulp.src(paths.scss)
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(gulp.dest(paths.assets))
		.pipe(connect.reload())
})

gulp.task("fonts", function() {
	return gulp.src(paths.fonts)
		.pipe(gulp.dest(paths.assets))
		.pipe(connect.reload())
})

gulp.task("haml", function() {
	return gulp.src(paths.haml)
		.pipe(haml())
		.pipe(gulp.dest(paths.root))
		.pipe(connect.reload())
})

gulp.task("watch", function() {
	gulp.watch(paths.js,   ["js"])
	gulp.watch(paths.scss, ["sass"])
	gulp.watch(paths.haml, ["haml"])
})

gulp.task("connect", function() {
	connect.server({
		livereload: true,
		port: 8000
	})
})

gulp.task("default", ["watch", "connect"])
gulp.task("build", ["js", "sass", "fonts", "haml"])
