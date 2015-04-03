(function(root, factory) {
  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define(['$', 'Bloodhound'], function($, Bloodhound) {
      return (root.synapse = root.Mn = factory(root, $, Bloodhound));
    });
  } else if (typeof exports !== 'undefined') {
    var $ = require('jquery'),
        Bloodhound = require('./bloodhound');
    module.exports = factory(root, $, Bloodhound);
  } else {
    root.synapse = factory(root, root.$, root.Bloodhound);
  }

}(this, function(root, $, Bloodhound) {
  'use strict';

  var restRoot = 'http://syn-web08.synapse-fr.com/api/saio/smartfaq/SmartFAQWCF.svc/rest/';

  //var restRoot = 'http://search.saio.fr/api/saio/smartfaq/SmartFAQWCF.svc/rest/';

  var frMap = {
    'a': /[àáâ]/gi,
    'c': /[ç]/gi,
    'e': /[èéêë]/gi,
    'i': /[ï]/gi,
    'o': /[ô]/gi,
    'oe': /[œ]/gi,
    'u': /[ü]/gi
  };

  var normalize = function(str) {
    $.each(frMap, function(normalized, regex) {
      str = str.replace(regex, normalized);
    });
    
    return str;
  };

  var queryTokenizer = function(q) {
    var normalized = normalize(q);
    return Bloodhound.tokenizers.whitespace(normalized);
  };

  var dupDetector = function(remoteMatch, localMatch) {
    //console.log(remoteMatch);
    //console.log(localMatch);
    //console.log(remoteMatch.answerId == localMatch.answerId);
    //console.log("-----------");
    return (remoteMatch.bIsQuestion ? remoteMatch.answerId : remoteMatch.id) == localMatch.answerId;
  };

  //var sorter = function (suggestion1, suggestion2) {
  //    //console.log(suggestion1);
  //    //console.log(suggestion2);
  //    //console.log("-----------");
  //    if (suggestion1.source == 'prefetch' && suggestion2.source == 'remote')
  //        return -1;
  //    if (suggestion1.source == 'remote' && suggestion2.source == 'prefetch')
  //        return 1;
  //    return 0;
  //};

  function synapse_suggest(user, password) {

    var credentialsInner = '<password>' + password + '<\/password><user>' + user + '<\/user>';
    this.Credentials = '<Credentials>' + credentialsInner + '<\/Credentials>';
    this.credentials = '<credentials>' + credentialsInner + '<\/credentials>';
    this.credentialsJson = { password: password, user: user };
    this.emptyMessage = '<div class="empty-message">unable to find any question matching your input</div>';
    this.strategy == 'words';

    this.setUpBloodhound = function() {

      var params = {
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('normalizedText'),
        queryTokenizer: queryTokenizer,

        //Bloodhound.tokenizers.whitespace,
        dupDetector: dupDetector,

        //sorter: sorter,
        prefetch: {
          url: restRoot + 'GetListQuestions',
          ajax: {
            type: "POST",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(this.credentialsJson),

            //contentType: "text/xml",
            //data: this.Credentials,
          },

          //ttl: 1000, // time (in milliseconds) the prefetched data should be cached in local storage; default is one day
          filter: function(response) {
            var result = $.map(response.questions, function(question) { 
              return { 
                normalizedText: normalize(question.text), 
                text: question.text, 
                answerId: question.answerId, 
                source: 'prefetch' 
              }; 
            });

            return result;
          }
        }
      };

      // if strategy is set to words, then switching to semantic search 
      // (remote for Bloodhound) is handled manually
      // so we had a remote source only if strategy is set to suggestions
      if (this.strategy == 'suggestions') {
        params.limit = this.semanticOffset;
        params.remote = {
          // we need to put the query in the url because typehead.js 
          // uses the url as a cache key (https://github.com/twitter/typeahead.js/issues/894#issuecomment-48852916)
          url: restRoot + 'DoSmartSearch?query=%QUERY',
          
          ajax: {
            type: "POST",
            dataType: 'json',

            //contentType: "application/json; charset=utf-8",
            //dataWithWildcard: JSON.stringify({
            //    credentials: this.credentialsJson,
            //    searchRequest: { index: 'Saio', lang: 'fr', request: '%QUERY' }
            //}),
            contentType: "text/xml",
            dataWithWildcard: '<RequestDataSearch>' + this.credentials + '<searchRequest><index>Saio<\/index><lang>fr<\/lang><request>' + '%QUERY' + '<\/request><\/searchRequest>' + '<\/RequestDataSearch>',
          },
      
          filter: function(response) {
            //xml = $.parseXML(response.searchResults.searchResults);
            //var results = [];
            //$(xml).find('suggestion').each(function () {
            //    results.push({ text: $(this).find('sentence').text(), answerId: $(this).attr('answerId'), source: 'remote' });
            //});
            //return results;
            var resultsJson = JSON.parse(response.searchResults.searchResults);
            var results = [];
            if (resultsJson.QA.results.suggestions) {
              console.log(resultsJson.QA.results.suggestions);
              $.each(resultsJson.QA.results.suggestions.suggestion, function(index, value) {
                results.push({ 
                  text: value.sentence, 
                  answerId: (value['@bIsQuestion'] === 'true' ? value['@answerId'] : value['@id']), 
                  source: 'remote' 
                });
              });
            }

            return results;
          },

          //rateLimitBy: null,
        };
      }

      this.bloodhound = new Bloodhound(params);
      this.bloodhound.initialize();
    };

    this.setUpBloodhound();

    this.useSemanticMatching = function(query) {
    var nbSpaces = (query.match(/ /g) || []).length
    return nbSpaces >= this.semanticOffset;
  };

    this.suggestionsMatcher = function() {
    var synapse_suggest_instance = this;
    return function findMatches(q, cb) {

      if (synapse_suggest_instance.useSemanticMatching(q)) {
        var smartSearchCallback = function(userQuestion) {
          return function(data, textStatus, jqXHR) {
            if (textStatus == "success") {
              //console.log(data.searchResults.searchResults);
              //xml = $.parseXML(data.searchResults.searchResults);
              //var results = [];
              //$(xml).find('suggestion').each(function () {
              //    results.push({ text: $(this).find('sentence').text(), answerId: $(this).attr('answerId'), source: 'remote' });
              //});
              //cb(results);
              var resultsJson = JSON.parse(data.searchResults.searchResults);
              console.log(JSON.stringify(resultsJson));
              var results = []; 
              if (resultsJson.QA.results.suggestions) {
                $.each(resultsJson.QA.results.suggestions.suggestion, function(index, value) {
                  results.push({ text: value.sentence, answerId: value['@answerId'], source: 'remote' });
                });
              }

              cb(results);
            }
          };
        };
        doSmartSearchWS(q, smartSearchCallback);
      } else {
        synapse_suggest_instance.bloodhound.get(q, function(suggestions) { cb(suggestions); });
      }
    };
  };

    this.clearPrefetchCache = function() {
    console.log("clear prefetching cache");
    this.bloodhound.clearPrefetchCache();
  };

    this.setQuestionSelectedHandler = function(handler) {
    $(this.selector).bind('typeahead:selected', function(event, suggestion, dataset) {
      // do stuff if necessary
      handler(suggestion);
    });
  };

    this.destroy = function() {
    $(this.selector).typeahead('destroy');
  };

    this.addSuggestionsToInput = function(selector, strategy, semanticOffset) {

      // TODO: should this function also expect a maxDisplayedSuggestions argument?

      console.log("init synapse suggest input with selector= " + selector + ", strategy= " + strategy + ", semanticOffset= " + semanticOffset);
        
      this.strategy = strategy;
      this.semanticOffset = semanticOffset;
      this.selector = selector;

      this.setUpBloodhound();

      var params = {
      name: 'questions',
      displayKey: 'text',
      templates: {
        empty: this.emptyMessage,
        suggestion: function(suggestion) { return '<span class="' + suggestion.source + '">' + suggestion.text + '</span>'; }
      }
    };

      if (this.strategy == 'suggestions') {
        params.source = this.bloodhound.ttAdapter();
      } else {
        params.source = this.suggestionsMatcher();
      }

      $(selector).typeahead({
        hint: false,
        highlight: false,
        minLength: 1
      }, params);
    };

    // unified interface
    
    this.fuzzyMatching = function(userQuery, callback) {
      this.bloodhound.get(userQuery, callback);
    };

    this.semanticMatching = function(userQuery, callback) {
      doSmartSearchWS(userQuery, callback);
    };
  }

};

