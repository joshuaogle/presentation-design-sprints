var gulp  = require('gulp')
var browserify = require('gulp-browserify')
var babel = require('gulp-babel')
var sass  = require('gulp-sass')

gulp.task('js', function () {
	return gulp.src('src/index.js')
		.pipe(browserify({
			transform: ['babelify'],
			debug: true,
		}))
		.pipe(gulp.dest('build'))
})

gulp.task('sass', function () {
	return gulp.src('src/index.scss')
		.pipe(sass())
		.pipe(gulp.dest('build'))
})

gulp.task('watch', function () {
	gulp.watch('src/*.js',   ['js'])
	gulp.watch('src/*.scss', ['sass'])
})

gulp.task('default', ['watch'])