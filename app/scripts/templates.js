'use strict';

var Handlebars = require('handlebars');

// Get Handlebar templates async when in developpement mode.
Handlebars.getTemplate = function(name) {
  if (Handlebars.templates === undefined ||
      Handlebars.templates[name] === undefined) {
    $.ajax({
      url: 'templates/' + name + '.hbs',
      success: function(data) {
        if (Handlebars.templates === undefined) {
          Handlebars.templates = {};
        }

        Handlebars.templates[name] = Handlebars.compile(data);
      },
      async: false
    });
  }

  return Handlebars.templates[name];
};
