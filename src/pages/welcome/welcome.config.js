'use strict';

module.exports = function($stateProvider) {
  'ngInject';

  // ROUTES

  $stateProvider.state('welcomeState',{
    name: 'welcome',
    url: '/welcome',
    views: {
      page: 'welcomeComponent'
    }
  });
};