var utils = require('cucumber-step-definitions/lib/helper/utils');

module.exports = function() {

  /**
   * Pick an option from jdewit/ez-select
   *
   * Spec: Given I ez-select "Some option text" from "Label Name"
   *
   * @param {string} arg1 The options text
   * @param {string} arg2 The inputs selector
   */
  this.Then(/^I ez-select "([^"]*)" from "([^"]*)"$/, function(arg1, arg2, callback) {
    utils.findInput(arg2).then(function(ezSelect) {
      return ezSelect.findElement(by.css('.tag-container')).then(function(tagContainer) {
        return tagContainer.click().then(function() {
          return ezSelect;
        });
      });
    }).then(function(ezSelect) {
      return ezSelect.findElements(by.linkText(arg1)).then(function(els) {
        return els[els.length -1];
      });
    }).then(function(link) {
      return link.click();
    }).then(callback);
  });

  this.Then(/^the "([^"]*)" ez-select should have "([^"]*)" selected$/, function(arg1, arg2, callback) {
    utils.findInput(arg1).then(function(ezSelect) {
      return ezSelect.findElement(by.xpath('//span[text()="' + arg2 + '"]'));
    }).then(function() {
      callback();
    }, function() {
      callback.fail(arg2 + ' is not ez-selected in ' + arg1);
    });
  });

};
