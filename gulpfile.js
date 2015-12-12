'use strict';

var gulp = require('gulp'),
    clean = require('gulp-clean'),
    cleanhtml = require('gulp-cleanhtml'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-zip'),
    transpile = require('gulp-es6-module-transpiler'),
    babel = require('gulp-babel'),
    sass = require('gulp-sass'),
    usemin = require('gulp-usemin');

//clean build directory
gulp.task('clean', function() {
  return gulp.src('build/*', {read:false}).pipe(clean());
});

//copy static assets into dist
gulp.task('copy', function() {

  gulp.src('app/_locales/**')
    .pipe(gulp.dest('build/_locales'));

  gulp.src('app/images/**')
    .pipe(gulp.dest('build/images'));

  return gulp.src('app/manifest.json')
    .pipe(gulp.dest('build'));
});

//copy and compress html
gulp.task('html', function() {
  return gulp.src('app/*.html')
    .pipe(cleanhtml())
    .pipe(gulp.dest('build'));
});

gulp.task('usemin', function() {
  return gulp.src('app/*.html')
    .pipe(usemin())
    .pipe(gulp.dest('build/'));
});

//compile sass and concat them
gulp.task('styles', function() {
  return gulp.src('app/styles/**/*.scss')
    .pipe(sass())
    .pipe(minifycss())
    .pipe(gulp.dest('build/styles'));
});

//transpile JS with ES6 transpiler and compile them to ES5
gulp.task('scripts', function() {
  return gulp.src('app/scripts/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(transpile({
      formatter: 'bundle',
      basePath: 'app/scripts'
    }))
    .pipe(gulp.dest('build/scripts'));
});

gulp.task('zip', ['usemin','html', 'scripts', 'styles', 'copy'], function() {
  var manifest = require('./app/manifest'),
      distFileName = manifest.name + ' v' + manifest.version + '.zip',
      mapFileName = manifest.name + ' v' + manifest.version + '-maps.zip';

  return gulp.src('build/**')
    .pipe(zip(distFileName))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean'], function(){
  gulp.start('zip');
});
