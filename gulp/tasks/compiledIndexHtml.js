'use strict';

var gulp = require('gulp');
var config = require('../config').indexHtml;
var browserSync  = require('browser-sync');

gulp.task('compiledIndexHtml', function() {
  return gulp.src(config.src)
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.reload({stream:true}));
});
