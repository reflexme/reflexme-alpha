'use strict';

module.exports = function($stateProvider,$urlRouterProvider,$httpProvider,$translateProvider,$compileProvider) {
  'ngInject';

  // Route to home if path provided unknown
  $urlRouterProvider.otherwise('/home');

  // Add some headers to all http calls
  $httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript';
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
  $httpProvider.defaults.headers.post['Access-Control-Max-Age'] = '1728000';
  $httpProvider.interceptors.push('authInterceptor');

  // Load translations
  $translateProvider
    .translations('en', require('./locales/en')())
    .translations('it', require('./locales/it')())
    .registerAvailableLanguageKeys(['en', 'it'], {
    'en_US': 'en',
    'en_UK': 'en',
    'it_IT': 'it',
    '*': 'en'
  })
  .determinePreferredLanguage()
  .fallbackLanguage('en')
  .useCookieStorage()
  .useSanitizeValueStrategy('sanitizeParameters');

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|http|javascript):/);
};