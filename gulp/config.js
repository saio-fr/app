'use strict';

var dest = './build';
var src = './app';

module.exports = {

  browserSync: {
    // server: {
    //   baseDir: dest
    // }
    server: 'false'
  },

  sass: {
    src: src + '/styles/**/*.{sass,scss}',
    dest: dest,
    settings: {
      indentedSyntax: true, // Enable .sass syntax!
      imagePath: 'images', // Used by the image-url helper
      errLogToConsole: true
    }
  },

  images: {
    src: src + '/images/**',
    dest: dest + '/images'
  },

  markup: {
    src: src + '/templates/**',
    dest: dest + '/templates'
  },

  indexHtml: {
    src: src + '/templates/*.html',
    dest: dest
  },

  browserify: {
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/scripts/vendors.js',
      dest: dest,
      outputName: 'vendors.js',
      // Additional file extentions to make optional
      extensions: ['.js'],
      // list of modules to make require-able externally
      // require: ['jquery', 'backbone/node_modules/underscore']
      // See https://github.com/greypants/gulp-starter/issues/87 for note about
      // why this is 'backbone/node_modules/underscore' and not 'underscore'
    },{
      entries: src + '/scripts/app.js',
      dest: dest,
      outputName: 'app.js',
      extensions: ['.js'],
      require: [
        'jquery', 
        'backbone/node_modules/underscore',
        'backbone',
        'autobahn',
        'Handlebars'
      ]
    },{
      entries: src + '/scripts/templates.js',
      dest: dest,
      outputName: 'templates.js',
      extensions: ['.hbs'],
      require: ['Handlebars']
    }]
  },

  production: {
    cssSrc: dest + 'css/*.css',
    jsSrc: dest + 'js/*.js',
    dest: dest
  }
};
