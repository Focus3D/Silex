/**
 * Silex, live web creation
 * http://projects.silexlabs.org/?/silex/
 *
 * Copyright (c) 2012 Silex Labs
 * http://www.silexlabs.org/
 *
 * Silex is available under the GPL license
 * http://www.silexlabs.org/silex/silex-licensing/
 */

/**
 * @fileoverview Property pane, displayed in the property tool box.
 * Controls the general params of the selected component
 *
 */

goog.require('silex.view.pane.PaneBase');
goog.provide('silex.view.pane.StylePane');



/**
 * on of Silex Editors class
 * let user edit style of components
 * @constructor
 * @extends {silex.view.pane.PaneBase}
 * @param {Element} element   container to render the UI
 * @param  {silex.types.Controller} controller  structure which holds
 *                                  the controller instances
 */
silex.view.pane.StylePane = function(element, controller) {
  // call super
  goog.base(this, element, controller);

  this.buildUi();
};

// inherit from silex.view.PaneBase
goog.inherits(silex.view.pane.StylePane, silex.view.pane.PaneBase);


/**
 * css class name input
 */
silex.view.pane.StylePane.prototype.cssClassesInput = null;


/**
 * instance of ace editor
 */
silex.view.pane.StylePane.prototype.ace = null;


/**
 * build the UI
 */
silex.view.pane.StylePane.prototype.buildUi = function() {
  this.cssClassesInput = goog.dom.getElementByClass('style-css-classes-input', this.element);
  goog.events.listen(this.cssClassesInput, goog.events.EventType.INPUT, this.onInputChanged, false, this);
  this.ace = ace.edit(goog.dom.getElementByClass('element-style-editor', this.element));
  this.iAmSettingValue = false;
  this.ace.getSession().setMode('ace/mode/css');
  this.ace.getSession().on('change', goog.bind(function() {
    if (this.iAmSettingValue === false) {
      setTimeout(goog.bind(function() {
        this.contentChanged();
      }, this), 100);
    }
  }, this));
};


/**
 * redraw the properties
 * @param   {Array.<Element>} selectedElements the elements currently selected
 * @param   {Document} document  the document to use
 * @param   {Array.<string>} pageNames   the names of the pages which appear in the current HTML file
 * @param   {string}  currentPageName   the name of the current page
 */
silex.view.pane.StylePane.prototype.redraw = function(selectedElements, document, pageNames, currentPageName) {
  if (this.iAmSettingValue) return;
  this.iAmRedrawing = true;
  // call super
  goog.base(this, 'redraw', selectedElements, document, pageNames, currentPageName);

  // css classes
  var cssClasses = this.getCommonProperty(selectedElements, goog.bind(function(element) {
    return this.controller.propertyToolController.getClassName(element);
  }, this));
  if (cssClasses) {
    this.cssClassesInput.value = cssClasses;
  }
  else {
    this.cssClassesInput.value = '';
  }

  // css inline style
  var cssInlineStyle = this.getCommonProperty(selectedElements, goog.bind(function(element) {
    return this.controller.propertyToolController.getInlineStyle(element);
  }, this));
  if (cssInlineStyle) {
    this.iAmSettingValue = true;
    try {
      var str = '.element{\n' + cssInlineStyle.replace(/; /gi, ';\n') + '\n}';
      var pos = this.ace.getCursorPosition();
      this.ace.setValue(str, 1);
      this.ace.gotoLine(pos.row + 1, pos.column, false);
    }
    catch (err) {
      // error which will not keep this.iAmSettingValue to true
      console.error('an error occurred while editing the value', err);
    }
    this.iAmSettingValue = false;
  }
  else {
    this.iAmSettingValue = true;
    try {
      this.ace.setValue('.element{\n/' + '* multiple elements selected *' + '/\n}', 1);
    }
    catch (err) {
      // error which will not keep this.iAmSettingValue to true
      console.error('an error occurred while editing the value', err);
    }
    this.iAmSettingValue = false;
  }
  this.iAmRedrawing = false;
};


/**
 * User has selected a color
 */
silex.view.pane.StylePane.prototype.onInputChanged = function() {
  if (this.iAmSettingValue) return;
  this.iAmSettingValue = true;
  try {
    this.controller.propertyToolController.setClassName(this.cssClassesInput.value);
  }
  catch (err) {
    // error which will not keep this.iAmSettingValue to true
    console.error('an error occurred while editing the value', err);
  }
  this.iAmSettingValue = false;
};


/**
 * the content has changed, notify the controller
 */
silex.view.pane.StylePane.prototype.contentChanged = function() {
  if (this.iAmSettingValue) return;
  var value = this.ace.getValue();
  if (value) {
    value = value.replace('.element{\n', '');
    value = value.replace('\n}', '');
    value = value.replace(/\n/, ' ');
  }
  this.iAmSettingValue = true;
  try {
    this.controller.propertyToolController.propertyChanged('style', value);
  }
  catch (err) {
    // error which will not keep this.iAmSettingValue to true
    console.error('an error occurred while editing the value', err);
  }
  this.iAmSettingValue = false;
};
