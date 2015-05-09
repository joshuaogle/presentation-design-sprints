var gulp         = require('gulp')
var connect      = require('gulp-connect')
var plumber      = require('gulp-plumber')
var browserify   = require('gulp-browserify')
var sass         = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')

gulp.task('js', function() {
	return gulp.src('src/index.js')
		.pipe(plumber())
		.pipe(browserify({
			transform: ['babelify'],
			debug: true,
		}))
		.pipe(gulp.dest('build'))
		.pipe(connect.reload())
})

gulp.task('sass', function() {
	return gulp.src('src/index.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(gulp.dest('build'))
		.pipe(connect.reload())
})

gulp.task('html', function() {
	return gulp.src('index.html')
		.pipe(connect.reload())
})

gulp.task('watch', function() {
	gulp.watch('src/*.js',   ['js'])
	gulp.watch('src/*.scss', ['sass'])
	gulp.watch('index.html', ['html'])
})

gulp.task('connect', function() {
	connect.server({
		livereload: true,
		port: 8000,
	})
})

gulp.task('default', ['watch', 'connect'])
gulp.task('build', ['js', 'sass'])
