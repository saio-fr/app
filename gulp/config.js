'use strict';

var dest = './build';
var src = './app';

module.exports = {

  browserSync: {
    server: {
      baseDir: dest
    }
  },

  sass: {
    src: src + '/styles/**/*.{sass,scss}',
    dest: dest + '/css',
    settings: {
      // Enable .sass syntax!
      indentedSyntax: false,

      // Used by the image-url helper
      imagePath: 'images',
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

  fonts: {
    src: src + '/fonts/**',
    dest: dest + '/fonts'
  },

  indexHtml: {
    src: src + '/templates/index.hbs',
    dest: dest
  },

  browserify: {
    transform: ['hbsfy'],

    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/scripts/vendors.js',
      dest: dest,
      outputName: 'vendors.js',

      // Additional file extentions to make optional
      extensions: ['.js'],
      debug: false,

      // list of modules to make require-able externally
      require:[
        'jquery',
        'backbone/node_modules/underscore',
        'underscore',
        'backbone',
        'backbone.marionette',
        'backbone.radio',
        'handlebars',
        'autobahn',
        'autosize'
      ]
    },
    {
      entries: src + '/scripts/app.js',
      dest: dest,
      outputName: 'app.js',
      extensions: ['.js'],

      // See https://github.com/greypants/gulp-starter/issues/87 for note about
      // why this is 'backbone/node_modules/underscore' and not 'underscore'
      external: [
        'jquery',
        'underscore',
        'backbone',
        'backbone.marionette',
        'backbone.radio',
        'autosize'
      ]
    },
    {
      entries: src + '/scripts/templates.js',
      dest: dest,
      outputName: 'templates.js',
      extensions: ['.hbs'],
      external: ['handlebars']
    }]
  },

  production: {
    cssSrc: dest + 'css/*.css',
    jsSrc: dest + 'js/*.js',
    dest: dest
  }
};
