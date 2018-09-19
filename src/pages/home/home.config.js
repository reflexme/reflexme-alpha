'use strict';

module.exports = function($stateProvider) {
  'ngInject';

  // ROUTES

  $stateProvider.state('homeState',{
    name: 'home',
    url: '/home',
    views: {
      page: 'homeComponent'
    }
  });
};