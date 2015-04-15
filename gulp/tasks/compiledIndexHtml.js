'use strict';

var gulp = require('gulp');
var config = require('../config').indexHtml;
var browserSync  = require('browser-sync');
var rename = require('gulp-rename');

gulp.task('compiledIndexHtml', function() {
  return gulp.src(config.src)
    .pipe(rename('index.html'))
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.reload({stream:true}));
});
