'use strict';

var gulp = require('gulp');
var $    = require('gulp-load-plugins')();
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var ngAnnotate = require('gulp-ng-annotate');
var s3 = require('gulp-s3-deploy');
var inquirer = require('inquirer');
var rename = require('gulp-rename');

var browserify = require('browserify');
var browserifyInc = require('browserify-incremental');

//// START DEPLOY TASK

gulp.task('deploy', function(done) {
  var fs = require('fs');

  var credentialsFile = './s3credentials.json';
  var credentials = {};

  fs.stat(credentialsFile, function(err) {
    if (err === null) {
      credentials = require(credentialsFile);
    } else {
      console.log('Create s3credentials.json, you can start from s3credentials.json.dist');
      return;
    }
  });

  var question = [{
    type: 'list',
    name: 'env',
    message: 'In which S3 bucket do you want to deploy the application?',
    choices: [ {
      name: 'Production',
      value: 'production'
    },{
      name: 'Staging',
      value: 'staging'
    }]
  }];

  return inquirer.prompt(question).then(function(res){
    gulp.src(['dist/**','!dist/app.js.map'])
      .pipe(s3(credentials[res['env']]));
  });

});

//// END DEPLOY TASK


//// START HTML TASK

gulp.task('html', ['icons'], function() {
  var stream = gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist/'));

  return stream;
});

//// END HTML TASK

//// START ICONS TASK

gulp.task('icons', ['images'], function(done) {

  gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.eot')
    .pipe(gulp.dest('dist/fonts/fontawesome'));
  gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.woff')
    .pipe(gulp.dest('dist/fonts/fontawesome'));
  gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.woff2')
    .pipe(gulp.dest('dist/fonts/fontawesome'));
  gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.ttf')
    .pipe(gulp.dest('dist/fonts/fontawesome'));

  
  done();
});

//// END ICONS TASK

//// START FONTS TASK
gulp.task('fonts', ['sass'], function() {
  var stream = gulp.src('src/assets/fonts/**/*')
    .pipe(gulp.dest('dist/fonts/'));

  return stream;
});

//// END FONTS TASK

//// START IMAGES TASK
gulp.task('images', ['fonts'], function() {
  gulp.src('src/assets/images/**/*')
    .pipe(gulp.dest('dist/images/'));
});

//// END IMAGES TASK


//// START SASS COMPILATION TASK

var sassPaths = [
  'node_modules/foundation-sites/scss'
];

gulp.task('sass', ['js'], function(done) {
  gulp.src('src/app.scss')
    .pipe($.sass({
      includePaths: sassPaths,
      outputStyle: 'compressed' // if css compressed **file size**
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('dist/'));

  gulp.src('src/ie.scss')
    .pipe($.sass({
      outputStyle: 'compressed' // if css compressed **file size**
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('dist/'));

  //tinyMce
  gulp.src('node_modules/tinymce/skins/lightgray/skin.min.css')
    .pipe(gulp.dest('dist/skins/lightgray'));
  gulp.src('node_modules/tinymce/skins/lightgray/content.min.css')
    .pipe(gulp.dest('dist/skins/lightgray'));
  done();
});

//// END SASS COMPILATION TASK

//// START JS TASK

gulp.task('js', ['lint'], function() {

  var browserifyOpts = {
    cache: {},
    packageCache: {},
    fullPaths: false,
    entries: 'src/app.module.js',
    debug: true,
    paths: [
      'src'
    ]
  };

  var b = browserify(browserifyOpts);
  browserifyInc(b, {cacheFile: './browserify-cache-build.json'});

  return b.bundle()
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(ngAnnotate())
      .pipe(uglify())
      .on('error', gutil.log)
      .pipe(gulp.dest('dist'));
});

//// END JS TASK

// build app and launch Browsersync, watch JS files
gulp.task('serve', ['js-nougly','sass'], function () {
    // all browsers reload after tasks are complete.

});

//// linting
gulp.task('lint', ['conf'], function() {
  var stream = gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
  return stream;
});

//// configure parameters for build
gulp.task('conf', [], function() {
  var question = [{
    type: 'list',
    name: 'env',
    message: 'For which env do you want to setup your app?',
    choices: ['prod', 'staging', 'local']
  }];

  return inquirer.prompt(question).then(function(res){
    gulp.src('./config-' + res['env'] + '.json', {base: './'})
      .pipe(rename('config.json'))
      .pipe(gulp.dest('src/config'));
  });
});

//// BUILD EVERYTHING
gulp.task('build', ['html']);


///////////// SERVE ///////////////////////
gulp.task('serve',['html-serve','icons-serve','images-serve','fonts-serve','sass-serve','js-serve'],function(){
  gulp.watch('src/**/*.js', {interval: 1000, mode: 'poll'}, ['js-watch']);
  gulp.watch('src/locales/*.json', {interval: 1000, mode: 'poll'}, ['js-watch']);
  gulp.watch('src/**/*.html', {interval: 1000, mode: 'poll'}, ['html-watch']);
  gulp.watch('src/**/*.scss', {interval: 1000, mode: 'poll'}, ['sass-watch']);
});

gulp.task('html-serve', function() {
  var stream = gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist/'));

  return stream;
});

// watch resources
gulp.task('js-watch', ['js-serve']);
gulp.task('html-watch', ['html-serve']);
gulp.task('sass-watch', ['sass-serve']);


gulp.task('js-serve', ['lint-serve'], function() {

  gulp.src('./config-local.json', {base: './'})
    .pipe(rename('config.json'))
    .pipe(gulp.dest('src/config'));

    var browserifyOpts = {
      cache: {},
      packageCache: {},
      fullPaths: true,
      entries: 'src/app.module.js',
      paths: [
        'src'
      ]
    };

   var b = browserify(browserifyOpts);
   browserifyInc(b, {cacheFile: './browserify-cache.json'});

   return b.bundle()
       .pipe(source('app.js'))
       .pipe(buffer())
       //.pipe(sourcemaps.init({ loadMaps: true }))
       .pipe(ngAnnotate())
       .on('error', gutil.log)
       //.pipe(sourcemaps.write('./'))
       .pipe(gulp.dest('dist'));
});

//// linting
gulp.task('lint-serve', function() {
  var stream = gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format());
  return stream;
});

// sass
gulp.task('sass-serve', function(done) {
  gulp.src('src/app.scss')
    .pipe($.sass({
      includePaths: sassPaths,
      outputStyle: 'compressed' // if css compressed **file size**
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('dist/'));

  gulp.src('src/ie.scss')
    .pipe($.sass({
      outputStyle: 'compressed' // if css compressed **file size**
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('dist/'));

  done();
});

gulp.task('icons-serve', function(done) {
  gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.eot')
    .pipe(gulp.dest('dist/fonts/fontawesome'));
  gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.woff')
    .pipe(gulp.dest('dist/fonts/fontawesome'));
  gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.woff2')
    .pipe(gulp.dest('dist/fonts/fontawesome'));
  gulp.src('node_modules/font-awesome/fonts/fontawesome-webfont.ttf')
    .pipe(gulp.dest('dist/fonts/fontawesome'));

  done();
});

gulp.task('fonts-serve', function() {
  var stream = gulp.src('src/assets/fonts/**/*')
    .pipe(gulp.dest('dist/fonts/'));

  return stream;
});

gulp.task('images-serve', function() {
  gulp.src('src/assets/images/**/*')
    .pipe(gulp.dest('dist/images/'));
});
