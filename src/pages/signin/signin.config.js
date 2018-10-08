'use strict';

module.exports = function($stateProvider) {
  'ngInject';

  // ROUTES

  $stateProvider.state('signinState',{
    name: 'signin',
    url: '/signin',
    views: {
      page: 'signinComponent'
    }
  });
};