'use strict';

module.exports = function($stateProvider) {
  'ngInject';

  // ROUTES

  $stateProvider.state('signupState',{
    name: 'signup',
    url: '/signup',
    views: {
      page: 'signupComponent'
    }
  });
};