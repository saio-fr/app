'use strict';

var Handlebars = require('Handlebars');

// Get Handlebar templates async when in developpement mode.
Handlebars.getTemplate = function(name) {
    if (Handlebars.templates === undefined ||
        Handlebars.templates[name] === undefined) {
        $.ajax({
            url : 'views/' + name + '.handlebars',
            success : function(data) {
                if (Handlebars.templates === undefined) {
                    Handlebars.templates = {};
                }
                Handlebars.templates[name] = Handlebars.compile(data);
            },
            async : false
        });
    }
    return Handlebars.templates[name];
};
