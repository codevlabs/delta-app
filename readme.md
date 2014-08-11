<p align="center">
  <a href="https://travis-ci.org/readfwd/delta-app" target="_blank">
    <img src="https://travis-ci.org/readfwd/delta-app.svg?branch=master" title="Build Status" />
  </a>
  <a href='https://coveralls.io/r/readfwd/delta-app?branch=master'>
    <img src='https://coveralls.io/repos/readfwd/delta-app/badge.png?branch=master' alt='Coverage Status' />
  </a>
</p>

# delta-app

Source code for the 'Danube Delta' tour guide app.

## Setting up the project

This is a PhoneGapped, single page, static webapp. All dependencies are handled through `npm`, and the build process is managed by `gulp`.

To set up the project, install `gulp` and the project dependencies:

```bash
$ npm install -g gulp
$ npm install
```

## Setting up Phonegap

To run `phonegap` related tasks, you'll also need to [install phonegap](http://phonegap.com/install/).
The android wrapper has been modified to include the [Crosswalk](https://crosswalk-project.org) runtime. Before using the Android platform in any way, you should run `build_deps.sh`.

Installation steps summed up:

```bash
$ npm install -g phonegap cordova
$ ./mobile/build_deps.sh
```

After this, you can just `cd mobile` and use phonegap and cordova commands freely from there.


### Available build workflow commands

#### Minimal build

```bash
$ gulp
$ # or
$ gulp build
```

This will compile a minimal working version (*not* production-ready) of the project into the `./.tmp` folder. No minification or optimization, this task should always do the least possible amount of work to get to something that works.

#### Production-ready build

```bash
$ gulp build:dist
```

This will run `gulp build` as a prerequisite and then proceed to perform a number of additional transformations (`uglify`, `csso`, `html-minify`, etc), outputting into the `./dist` folder.

#### Cleaning

```bash
$ gulp clean
$ # or
$ gulp clean:dist
```

This will delete the `./.tmp` or `./dist` folders respectively.

#### Serving the results

```bash
$ gulp serve
$ # or
$ gulp serve:dist
```

This will start a `browserSync` server with either the `./.tmp` or `./dist` directory as the source. `browserSync` will synchronize scroll events, form actions, [and more](http://www.browsersync.io).

#### Developing for the web

```bash
$ gulp watch
```

This will run the `gulp build` task, then a `gulp serve` server on top of it that will automatically refresh when you change anything relevant in `./app`.

#### Developing with phonegap


```bash
$ gulp watch:gap
```

This will run the `gulp build` task, and then start a `phonegap serve` server that you can connect to from your mobile devices by using the [PhoneGap Developer App](http://app.phonegap.com). It will also livereload upon detecting changes.

For running just the server with a livereload watch on `./.tmp` and without actually compiling anything:

```bash
$ gulp serve:gap
```

This is useful, for example, when running `gulp watch` and `gulp serve:gap` at the same time. This way, anything you modify in the sources will get picked up by `gulp watch`, compiled to `./.tmp` and pushed to `browserSync`, then picked up by `gulp serve:gap` and pushed to your phone.

#### Deployment with phonegap

After taking the steps described [above](#setting-up-phonegap), just use regular cordova:

```bash
$ cd mobile
$ cordova run android
$ # or
$ cordova run ios
$ # or
$ cordova compile android --release # To get a publish-ready APK
```

#### Testing

```bash
$ gulp test
```

This will run the tests on the files in the `./.tmp` directory by using a `phantomjs` headless browser, and re-run them upon detecting file changes. It will output the results to the console and optionally as system notifications if you're on OSX.

A typical development workflow will involve running either combination of:

* `gulp watch` and `gulp test`
* `gulp watch:gap` and `gulp test`

It will start a testing server on `http://localhost:9876`. You can connect to this server with as many test browsers on your network as you want. Leave them running with the tab open to have Karma use them for all future tests.

```bash
$ gulp test:once
```

This will run `gulp build`, and then the tests just one time. Used by `travis`. Additionally, it will also generate accurate coverage reports for `coveralls`.

#### Production server

```bash
$ foreman start
$ # or
$ ./node_modules/gulp/bin/gulp.js build:dist && node index.js
```

This will start the production `express` server (using the `./dist` folder) that doesn't do any fancy live-reloading or scroll synchronization, but does `gzip` your assets and handles single page application `seo`.

#### Pagespeed

```bash
$ # if you're using `foreman start`, it'll start the server on `localhost:5000`
$ PORT=5000 gulp pagespeed
```

Use this in combination with the production server to alias it to a [secure external tunnel URL](https://ngrok.com), which will then get passed to [Google Pagespeed Insights](https://developers.google.com/speed/pagespeed/insights/). You'll receive a report in your terminal about how to further improve the performance of the application.

## Tools, libraries and languages used

* `gulp` - build workflow
* `browserify` - JavaScript bundle generation
* `karma` - test runner
* `mocha` - test framework
* `should` - assertion library
* `istanbul` - coverage reports
* `browserSync` - development server
* `phonegap` - mobile app packaging
* `famous` - view library
* `jade` - HTML preprocessor
* `stylus` - CSS preprocessor
* `jshint` - JavaScript linting
* `travis` - continuous integration
* `coveralls` - online coverage reports

## Project structure

Base folders:

```bash
.
├── app           # raw application logic and assets
├── gulp          # build tasks
└── test          # frontend tests
```

Temporary folders:

```bash
.
├── .tmp          # minimal build
├── dist          # production build
├── coverage      # coverage information
└── node_modules  # node dependencies
```

## Contributing

* All commits and pull requests get processed by `travis`, which runs the test suite. Every build will also report to `coveralls`.
* Fork the project and send in pull requests.
* Lint JavaScript code with `jshint`, which will automatically pick up the included `.jshintrc`.

## License

GPL.
