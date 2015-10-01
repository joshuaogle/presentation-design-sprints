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
	images: "source/images/*",
	js: "source/javascripts/**/*.js",
	root: "./",
	stylesheets: "source/stylesheets/**/*.scss",
	stylesheets_master: "source/stylesheets/slides.scss",
	stylesheets_dir: "source/stylesheets/",
	templates: "source/templates/**/*.html",
	templates_dir: "source/templates/",
	templates_master: "source/templates/slides.html"
}

gulp.task("layout", function() {
	nunjucksRender.nunjucks.configure(paths.templates_dir)
	return gulp.src(paths.templates_master)
	  .pipe(nunjucksRender({
			red: "#c52d2f",
			slate: "#393b44",
			smoke: "#ececec",
		}))
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
	return gulp.src(paths.stylesheets)
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

gulp.task("images", function() {
	return gulp.src(paths.images)
		.pipe(gulp.dest(paths.assets))
		.pipe(connect.reload())
})

gulp.task("watch", function() {
	gulp.watch(paths.js,   ["js"])
	gulp.watch(paths.stylesheets, ["sass"])
	gulp.watch(paths.templates, ["layout"])
})

gulp.task("connect", function() {
	connect.server({
		livereload: true,
		port: 8000
	})
})

gulp.task("build", ["js", "sass", "fonts", "images", "layout"])
gulp.task("default", ["build", "watch", "connect"])
