var autoprefixer   	= require("gulp-autoprefixer")
var browserify     	= require("gulp-browserify")
var concat			   	= require("gulp-concat")
var connect        	= require("gulp-connect")
var data 						= require("gulp-data")
var gulp           	= require("gulp")
var nunjucksRender 	= require("gulp-nunjucks-render")
var plumber      		= require("gulp-plumber")
var rename      		= require("gulp-rename")
var sass         		= require("gulp-sass")

var paths = {
	assets: "assets",
	fonts: "source/fonts/*.*",
	html: "source/templates/slides.html",
	js: "source/javascripts/**/*.js",
	root: "./",
	scss: "source/stylesheets/slides.scss"
}

gulp.task("html", function() {
	nunjucksRender.nunjucks.configure(["source/templates/"])
	return gulp.src(paths.html)
	  .pipe(nunjucksRender())
		.pipe(rename("index.html"))
		.pipe(gulp.dest(paths.root))
		.pipe(connect.reload())
})

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

gulp.task("watch", function() {
	gulp.watch(paths.js,   ["js"])
	gulp.watch(paths.scss, ["sass"])
	gulp.watch(paths.html, ["html"])
})

gulp.task("connect", function() {
	connect.server({
		livereload: true,
		port: 8000
	})
})

gulp.task("default", ["build", "watch", "connect"])
gulp.task("build", ["js", "sass", "fonts", "html"])
