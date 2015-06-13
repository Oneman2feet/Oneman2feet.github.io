var gulp = require('gulp'); 
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var minify = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var order = require('gulp-order');
var filter = require('gulp-filter');
var lib = require('bower-files')();

// For plumber
function onError(err) {
  console.log(err);
}

// Lint Task
gulp.task('lint', function() {
  return gulp.src('js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Compile Sass
gulp.task('sass', function() {
  var sassFiles = ['scss/*.scss'];
  gulp.src(lib.ext('css').files.concat(sassFiles))
    .pipe(order([
      'normalize.css',
      'base.scss',
      '*'
    ]))
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sass())
    .pipe(prefix('last 2 versions'))
    .pipe(concat('style.min.css'))
    .pipe(minify())
    .pipe(gulp.dest('dist'))
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  return gulp.src('js/*.js')
      .pipe(concat('all.js'))
      .pipe(rename('all.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('js/*.js', ['lint', 'scripts']);
  gulp.watch('scss/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);