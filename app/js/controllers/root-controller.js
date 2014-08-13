var util = require('util');
var cordova = require('../shims/cordova');
var Famous = require('../shims/famous');
var ViewController = require('./view-controller');
var MenuController = require('./menu-controller');

function RootController () {
  ViewController.apply(this, arguments);

  var self = this;
  self.context = Famous.Engine.createContext();
  self.menuController = new MenuController();
  self.context.add(self.getView());
}
util.inherits(RootController, ViewController);

RootController.prototype.loadView = function () {
  var self = this;
  var contentView = new Famous.View();

  contentView.add(new Famous.StateModifier({
    transform: Famous.Transform.behind
  })).add(new Famous.Surface({
    classes: ['content-bg']
  }));

  self.contentView = contentView;

  var iOS7 = (cordova.present &&
              window.device.platform === 'iOS' &&
              parseInt(window.device.version) >= 7);
  if (iOS7) {
    var layout = new Famous.HeaderFooterLayout({
      headerSize: 20
    });
    layout.header.add(new Famous.Surface({
      classes: ['status-bar']
    }));
    layout.content.add(contentView);

    self.view = layout;
  } else {
    self.view = contentView;
  }

  self.contentView.add(self.menuController.getView());
};

module.exports = RootController;
