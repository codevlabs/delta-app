'use strict';

var gulp = require('gulp');

var config = require('./_config.js');
var paths = config.paths;
var $ = config.plugins;

var nodefn = require('when/node');
var fs = require('fs');
var exec = require('child_process').exec;
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var istanbul = require('browserify-istanbul');
var browserSync = require('browser-sync');
var templatizer = require('templatizer');

var opts = {
  autoprefixer: [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ]
};

// Turn index.jade into an HTML file.
gulp.task('index.html', function () {
  return gulp.src(paths.app + '/index.jade')
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest(paths.tmp))
    .pipe(browserSync.reload({stream: true}));
});

// Device demos
gulp.task('device-demos', ['build'], function () {
  gulp.src(paths.app + '/device-demo/index.jade')
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest(paths.tmp + '/device-demo/'))
    .pipe(browserSync.reload({stream: true}));
  gulp.src(paths.app + '/css/device-demo/device-demo.styl')
    .pipe($.stylus())
    .pipe($.autoprefixer(opts.autoprefixer))
    .pipe($.minifyCss())
    .pipe(gulp.dest(paths.tmp + '/css/device-demo'));;
});

// Generate JS functions from Jade templates.
// Run this before any JS task, because Browserify needs to bundle them in.
gulp.task('templates', function () {
  return templatizer(paths.app + '/templates', paths.app + '/js/lib/templates.js');
});

// Common outputs between all of the JS tasks.
var spitJs = function (bundleStream) {
  return bundleStream
    .pipe(source(paths.app + '/js/main.js'))
    .pipe($.rename('main.js'))
    .pipe(gulp.dest(paths.tmp + '/js/'));
};

// Bundles Browserify for production; no source or coverage maps.
gulp.task('js', ['templates'], function () {
  var bundleStream = browserify(paths.app + '/js/main.js')
    .bundle();

  return spitJs(bundleStream);
});

// Bundles Browserify with Istanbul coverage maps.
gulp.task('js:istanbul', ['templates'], function () {
  var bundleStream = browserify(paths.app + '/js/main.js')
    .transform(istanbul({
      ignore: ['**/lib/**']
    }))
    .bundle();

  return spitJs(bundleStream);
});

// Bundles Browserify with sourcemaps.
gulp.task('js:dev', ['templates'], function () {
  var bundleStream = browserify({
      entries: paths.app + '/js/main.js',
      debug: true
    })
    .bundle()
    .on('error', config.handleError);

  return spitJs(bundleStream)
    .pipe(browserSync.reload({stream: true}));
});

// Common actions between all of the CSS tasks
function spitCss() {
  return gulp.src(paths.app + '/css/main.styl')
    .pipe($.stylus())
    .pipe($.autoprefixer(opts.autoprefixer));
}

// Copies over and minifies CSS.
gulp.task('css', function () {
  return spitCss()
    .pipe($.minifyCss())
    .pipe(gulp.dest(paths.tmp + '/css'));
});

// Copies over CSS.
gulp.task('css:dev', function () {
  return spitCss()
    .pipe(gulp.dest(paths.tmp + '/css'))
    .pipe(browserSync.reload({stream: true}));
});

// Deletes the assets folder or symlink.
gulp.task('assets:clean', function () {
  return nodefn.call(exec, 'rm -r "' + paths.tmp + '/assets"').catch(function(){});
});

// Creates the .tmp folder if it does not already exists.
gulp.task('mktmp', function () {
  return nodefn.call(exec, 'mkdir -p "' + paths.tmp + '"');
});

// Copies over assets.
gulp.task('assets', ['assets:clean', 'mktmp'], function () {
  return nodefn.call(fs.symlink, '../app/assets', paths.tmp + '/assets');
});

// Copies over assets for production.
gulp.task('assets:dist', function () {
  return gulp.src(paths.app + '/assets/**/*')
     .pipe(gulp.dest(paths.dist + '/assets/'));
});

// Minimal development build.
gulp.task('build', ['index.html', 'js:dev', 'css:dev', 'assets']);

// CI testing build, with coverage maps.
gulp.task('build:test', ['index.html', 'js:istanbul', 'css:dev', 'assets']);

// Production-ready build.
gulp.task('build:dist', ['index.html', 'js', 'css', 'assets:dist'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var htmlFilter = $.filter('**/*.html');
  var assets = $.useref.assets();

  return gulp.src(paths.tmp + '/index.html')
    .pipe(assets)

    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore())

    .pipe(cssFilter)
    .pipe(cssFilter.restore())

    .pipe(assets.restore())
    .pipe($.useref())

    .pipe(htmlFilter)
    .pipe($.minifyHtml())
    .pipe(htmlFilter.restore())

    .pipe(gulp.dest(paths.dist));
});
