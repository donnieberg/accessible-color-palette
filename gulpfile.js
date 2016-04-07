var gulp = require('gulp'),
    uglify = require('gulp-uglify'), //Uglify minifies js files for production
    browserify = require('gulp-browserify'),
    connect = require('gulp-connect'),
    prefix = require('gulp-autoprefixer'),
    gulpif = require('gulp-if'), //can use it to check env
    sass = require('gulp-ruby-sass'),
    minifyCSS = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename');

// in cli, set env before running gulp tasks that depend on
// which env ie. NODE_ENV=production gulp js
var env = process.env.NODE_ENV || 'development';
var outputDir = 'builds/development';

//Don't need to compile anything but clone src/html to outputDir and livereload that shit
gulp.task('html', function(){
  return gulp.src('*.html')
    .pipe(connect.reload());
});

gulp.task('sass', function(){
  return sass('sass/i.scss')
    .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
    .pipe(minifyCSS())
    .pipe(rename('i.min.css'))
    .pipe(gulp.dest('./css/'))
    .pipe(connect.reload());
});

gulp.task('minifyIconFonts', function() {
  return gulp.src('assets/fonts/**/*.css')
    .pipe(minifyCSS())
    .pipe(concat('icon-fonts.min.css'))
    .pipe(gulp.dest('./css/'))
})

gulp.task('js', function(){
  return gulp.src('js/**/*.js')
    .pipe(browserify({ debug: env == 'development' }))
    .pipe(connect.reload());
});

gulp.task('minifyJS', function() {
  gulp.src(['bower_components/jquery/dist/jquery.min.js', 'bower_components/underscore/underscore-min.js', 'bower_components/angular/angular.min.js','bower_components/angular-scroll/angular-scroll.min.js', 'js/vendor/bootstrap-colorpicker-module.js', 'bower_components/tinycolor/tinycolor.js', 'bower_components/mixitup/build/jquery.mixitup.min.js'])
    .pipe(concat('vendorJS.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'))
})

//Watch for any changes to files in these folders, and if so, run the gulp tasks
gulp.task('watch', function(){
  gulp.watch('*.html', ['html']);
  gulp.watch('sass/**/*.scss', ['sass']);
  gulp.watch('js/**/*.js', ['js']);
});

//Boot up a server on localhost:8000 pointing to the outputDir as the root
gulp.task('connect', function(){
  connect.server({
    //root: '/builds/html/',
    port: 8000,
    livereload: true
  });
});

//When you run gulp command in cli, run all these tasks
gulp.task('default', ['html', 'sass', 'minifyIconFonts', 'js', 'minifyJS', 'watch', 'connect',]);
