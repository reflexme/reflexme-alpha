'use strict';

require('angular').module('signup', []);

var signup = require('angular').module('signup');

signup.config(require('./signup.config'));
signup.component('signupComponent',require('./signup.component'));