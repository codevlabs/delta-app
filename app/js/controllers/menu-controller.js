var util = require('util');
var NavigationController = require('./navigation-controller');
var MapController = require('./map-controller');
var Famous = require('../shims/famous');
var _ = require('lodash');
var templates = require('../lib/templates');
var TemplateController = require('./template-controller');
var cordova = require('../shims/cordova.js');

function MenuController(options) {
  options = options || {};
  options.buttonDescriptors = options.buttonDescriptors || {};
  options.buttonLayout = options.buttonLayout || [];
  NavigationController.call(this, options);

  var self = this;

  self.buttons = [];
  self.on('navigateBack', function() {
    Famous.Timer.setTimeout(function() {
      self.presentIn();
    }, 200);
  });
}
util.inherits(MenuController, NavigationController);

MenuController.prototype.buildButtonForLabel = function(label) {
  var self = this;

  var buttonDescriptor = self.options.buttonDescriptors[label];

  var renderNode = new Famous.RenderNode();
  var surface = new Famous.ContainerSurface({
    classes: ['menu-button', 'menu-' + label],
  });
  var buttonText = new Famous.Surface({
    classes: ['menu-button-text', 'menu-' + label],
    content: buttonDescriptor.title,
    size: [true, true],
  });
  var textModifier = new Famous.StateModifier({
    transform: Famous.Transform.inFront,
    align: [0.5, 0.5],
    origin: [0.5, 0.5],
  });
  var modifier = new Famous.Modifier();
  var showModifier = new Famous.ShowModifier({
    visible: false,
  });
  var node = renderNode.add(modifier).add(showModifier);
  node.add(surface);
  surface.add(textModifier).add(buttonText);

  self.buttons.push({
    modifier: modifier,
    showModifier: showModifier,
  });
  modifier.label = label;

  surface.on(cordova.clickEvent, function (evt) {
    self.navigateToLabel(label);
  });

  buttonText.pipe(surface);

  return {
    root: renderNode,
    surface: surface,
  };
};

MenuController.prototype.navigateToLabel = function (label) {
  var self = this;
  if (self.viewController) { return; }

  var buttonDescriptor = self.options.buttonDescriptors[label];
  var viewController = buttonDescriptor.viewController;
  if (typeof(viewController) === 'function') {
    viewController = viewController();
  }
  if (!viewController) {
    return;
  }

  self.setNavigationItem(viewController);

  //Defer animation to next tick to prevent heavy load from ruining it
  Famous.Timer.after(function () {
    self.presentOut(label);
  }, 2);
};

MenuController.prototype.present = function (isIn, skip) {
  var self = this;

  var distance = 30;
  var delayOff = isIn ? 40 : 30;

  var start = isIn ? 0 : 1;
  var end = isIn ? 1 : 0;
  var easing = isIn ? 'easeOut' : 'easeIn';

  var buttons = _.shuffle(self.buttons);
  _.each(buttons, function(button, i) {
    var modifier = button.modifier;
    var showModifier = button.showModifier;
    var delay = i * delayOff;
    if (modifier.label === skip) {
      delay = 150;
    }
    Famous.Timer.setTimeout(function() {
      showModifier.show();

      var state = new Famous.Transitionable(start);
      state.set(end, {
        duration: 200,
        curve: easing,
      }, function () {
        if (!isIn) {
          showModifier.hide();
        }
      });

      modifier.opacityFrom(state);
      if (modifier.label !== skip) {
        modifier.transformFrom(function() {
          return Famous.Transform.translate(0, 0, (1 - state.get()) * distance);
        });
      }
    }, delay);
  });
};

MenuController.prototype.presentOut = function (label) {
  this.present(false, label);
};

MenuController.prototype.presentIn = function () {
  this.present(true);
};

MenuController.prototype.buildGrid = function (parentNode) {
  var self = this;

  var borderWidth = 15;
  var buttonHeight = 100;

  var buttonLayout = self.options.buttonLayout;
  var verticalLayout = new Famous.GridLayout({
    dimensions: [1, buttonLayout.length],
    gutterSize: [0, borderWidth],
  });

  // Set up the scrollView
  var scrollView;
  var modifier = new Famous.StateModifier();
  var renderNode = new Famous.RenderNode();
  renderNode.add(modifier).add(verticalLayout);

  scrollView = new Famous.ScrollView();
  scrollView.sequenceFrom([renderNode]);
  verticalLayout.pipe(scrollView);

  function configureHeight() {
    var layoutHeight = (buttonHeight + borderWidth) * buttonLayout.length - borderWidth;
    var screenHeight = window.innerHeight - 2 * borderWidth;
    if (cordova.iOS7App) {
      screenHeight -= 20;
    }
    if (screenHeight > layoutHeight) {
      layoutHeight = screenHeight;
    }
    modifier.setSize([undefined, layoutHeight]);
  }

  Famous.Engine.on('resize', configureHeight);
  configureHeight();

  // Building the layout
  var verticalViews = [];

  verticalLayout.sequenceFrom(verticalViews);
  _.each(buttonLayout, function (buttons) {
    var horizontalViews = [];
    var horizontalLayout = new Famous.GridLayout({
      dimensions: [buttons.length, 1],
      gutterSize: [borderWidth, 0],
    });

    verticalViews.push(horizontalLayout);
    horizontalLayout.sequenceFrom(horizontalViews);
    horizontalLayout.pipe(scrollView);

    _.each(buttons, function (label) {
      var button = self.buildButtonForLabel(label);
      horizontalViews.push(button.root);
      button.surface.pipe(scrollView);
    });
  });


  // Set up the gutter
  var verticalGutter = new Famous.FlexibleLayout({
    ratios: [true, 1, true],
    direction: 1,
  });
  verticalGutter.sequenceFrom([new Famous.Surface({
    size: [undefined, borderWidth],
  }), scrollView, new Famous.Surface({
    size: [undefined, borderWidth],
  })]);

  var horizontalGutter = new Famous.FlexibleLayout({
    ratios: [true, 1, true],
    direction: 0,
  });
  horizontalGutter.sequenceFrom([new Famous.Surface({
    size: [borderWidth, undefined],
  }), verticalGutter, new Famous.Surface({
    size: [borderWidth, undefined],
  })]);

  parentNode.add(horizontalGutter);

  // Set up the background scroll capture view
  var captureSurfaceModifier = new Famous.StateModifier({
    transform: Famous.Transform.behind,
  });
  var captureSurface = new Famous.Surface({
    size: [undefined, undefined],
  });
  parentNode.add(captureSurfaceModifier).add(captureSurface);
  captureSurface.pipe(scrollView);
};

MenuController.prototype.createNavRenderController = function () {
  var renderController = new Famous.RenderController({
    inTransition: {
      method: 'delay',
      delay: 300,
      delayMethod: Famous.SpringTransition,
      period: 500,
      dampingRatio: 0.5,
    },
    outTransition: {
      duration: 500,
      curve: 'easeIn',
    }
  });

  var distance = 30;

  renderController.inTransformFrom(function (progress) {
    return Famous.Transform.translate(0, 0, distance * (progress - 1));
  });
  renderController.outTransformFrom(function (progress) {
    return Famous.Transform.translate(0, 0, distance * (progress - 1));
  });

  return renderController;
};

MenuController.prototype.buildRenderTree = function (parentNode) {
  var self = this;

  self.buildGrid(parentNode);
  self.buildNavRenderController(parentNode);

  Famous.Timer.setTimeout(function () {
    self.presentIn();
  }, 600);
};

module.exports = MenuController;
