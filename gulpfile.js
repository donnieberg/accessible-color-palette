var gulp = require('gulp'),
    uglify = require('gulp-uglify'), //Uglify minifies js files for production
    browserify = require('gulp-browserify'),
    connect = require('gulp-connect'),
    prefix = require('gulp-autoprefixer'),
    gulpif = require('gulp-if'), //can use it to check env
    sass = require('gulp-ruby-sass');

// in cli, set env before running gulp tasks that depend on
// which env ie. NODE_ENV=production gulp js
var env = process.env.NODE_ENV || 'development';
var outputDir = 'builds/development';

//Don't need to compile anything but clone src/html to outputDir and livereload that shit
gulp.task('html', function(){
  return gulp.src('*.html')
    //.pipe(gulp.dest(outputDir))
    .pipe(connect.reload());
});

gulp.task('sass', function(){
  var config = {};
  if(env == 'development'){
    config.sourcemap = true; //for debugging in the browser
    config.style = 'compact';
  } else if (env == 'production') {
    config.style = 'compressed'; //minify that shit
  }
  return gulp.src('sass/i.scss')
    .pipe(sass(config))
    .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
    .pipe(gulp.dest('./css/'))
    .pipe(connect.reload());
});

//Don't need to compile anything but clone src/js to outputDir and livereload that shit
gulp.task('js', function(){
  return gulp.src('js/**/*.js')
    .pipe(browserify({ debug: env == 'development' }))
    .pipe(gulpif(env == 'production', uglify()))
    //.pipe(gulp.dest(outputDir + '/js'))
    .pipe(connect.reload());
});

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
gulp.task('default', ['watch', 'html', 'sass', 'js', 'connect']);
