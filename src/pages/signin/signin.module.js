'use strict';

require('angular').module('signin', []);

var signin = require('angular').module('signin');

signin.config(require('./signin.config'));
signin.component('signinComponent',require('./signin.component'));