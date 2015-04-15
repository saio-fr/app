'use strict';

var $         = require('jquery');
var _         = require('underscore');
var Backbone  = require('backbone');
Backbone.$    = $;
var Mn        = require('backbone.marionette');
var Radio     = require('backbone.radio');
var autosize  = require('autosize');

// Shiiiiiiiim :D (waiting for Marionette V3.0 to integrate Backbone.radio by defaut)
(function() { 
  Mn.Application.prototype._initChannel = function () {
    this.channelName = _.result(this, 'channelName') || 'global';
    this.channel = _.result(this, 'channel') || Radio.channel(this.channelName);
  };
}());

var App = Mn.Application.extend({
  initialize: function(options) {
    console.log('My container:', options.container);
    // Use the little autosize plugin to autosize all textareas;
  }
});

autosize($('textarea'));

// Although applications will not do anything
// with a `container` option out-of-the-box, you
// could build an Application Class that does use
// such an option.
var app = new App({container: '.app-container'});
