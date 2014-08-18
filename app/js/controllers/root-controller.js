var util = require('util');
var cordova = require('../shims/cordova');
var Famous = require('../shims/famous');
var ViewController = require('./view-controller');
var MainMenuController = require('./mainmenu-controller');

function RootController () {
  ViewController.apply(this, arguments);

  var self = this;

  self.context = Famous.Engine.createContext();
  self.context.setPerspective(100);
  self.menuController = new MainMenuController();
  self.buildRenderTree(self.context);
}
util.inherits(RootController, ViewController);

RootController.prototype.buildRenderTree = function (parentNode) {
  var self = this;
  var contentView = parentNode;

  if (cordova.iOS7App) {
    var layout = new Famous.HeaderFooterLayout({
      headerSize: 20
    });
    layout.header.add(new Famous.Surface({
      classes: ['status-bar']
    }));

    contentView = layout.content;
    parentNode.add(layout);
  }

  self.menuController.buildRenderTree(contentView);
};

module.exports = RootController;
