var Famous = {};

Famous.View = require('famous/core/View');
Famous.Engine = require('famous/core/Engine');
Famous.Surface = require('famous/core/Surface');
Famous.Transform = require('famous/core/Transform');
Famous.RenderNode = require('famous/core/RenderNode');

Famous.StateModifier = require('famous/modifiers/StateModifier');

Famous.Transitionable = require('famous/transitions/Transitionable');
Famous.SnapTransition = require('famous/transitions/SnapTransition');
Famous.SpringTransition = require('famous/transitions/SpringTransition');
Famous.Transitionable.registerMethod('snap', SnapTransition);
Famous.Transitionable.registerMethod('spring', SpringTransition);

Famous.GridLayout = require('famous/views/GridLayout');
Famous.RenderController = require('famous/views/RenderController');
Famous.HeaderFooterLayout = require('famous/views/HeaderFooterLayout');

Famous.Timer = require('famous/utilities/Timer');

module.exports = Famous;
