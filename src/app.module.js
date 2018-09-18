'use strict';

// global.$ = global.jQuery = require('jquery');
// require('what-input');

var angular = require('angular');
require('angular-i18n/angular-locale_it-it');
require('angular-cookies');
require('angular-sanitize');
require('@uirouter/angularjs');
require('angular-translate');
require('angular-translate-storage-cookie');
require('angular-file-upload');
require('@cgross/angular-notify');

angular.module('app', [
  'ngCookies',
  'ngSanitize',
  'ui.router',
  'pascalprecht.translate',
  'pages'
]);

var app = angular.module('app');
app.config(require('./app.config'));
app.run(require('./app.run'));
app.service('authInterceptor', function($q) {
  'ngInject';
  var service = this;
  service.responseError = function(response) {
    if (response.status === 401){
        window.location = '/#!/login';
    }
    return $q.reject(response);
  };
});

// App level services
require('./services');

// App pages
require('./pages');

// App Root Component
app.component('refmeAppRoot',require('./components/refme_app_root/refme_app_root.component'));