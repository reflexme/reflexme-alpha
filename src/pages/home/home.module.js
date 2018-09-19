'use strict';

require('angular').module('home', []);

var home = require('angular').module('home');

home.config(require('./home.config'));
home.component('homeComponent',require('./home.component'));