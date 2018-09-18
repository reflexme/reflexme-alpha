'use strict';

// module.exports = function($state,$transitions,bookmark,auth,apiConnector){
module.exports = function($state,$transitions){
  'ngInject';

  $transitions.onBefore({}, function(transition){
    var stateService = transition.router.stateService;
    // register bookmark on every ui-router state change
    if (transition.to().name === 'loginState' || transition.to().name === 'changePasswordState'){
      return;
    }

    // console.log(transition.to().name,transition.params());
    // bookmark.set(transition.to().name,transition.params());

    // apiConnector.getUserSession(auth.getToken()).then(
    //   function(){
    //     // console.log('go to target state');
    //     // do nothing
    //   },function(){
    //     // console.log('redirect to login');
    //     return stateService.go('loginState');
    //   });
  });

  $state.defaultErrorHandler(function(error) {
    if (error.detail === 'USER_NOT_LOGGED_IN'){
      $state.target('loginState');
    }
  });
};