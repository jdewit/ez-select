'use strict';

/**
 * ez.select module
 *
 * @author Joris de Wit <joris.w.dewit@gmail.com>
 * @license MIT
 */
angular.module('ez.select', ['ez.object2array'])

/**
 * ezSelectConfig
 *
 * A constant you can override anywhere in your app to change the default ez-select config
 * Configs set as atttributes will override these configs
 * Configs set on the directives scope "config" will override configs set as attrs or in this constant
 */
.constant('ezSelectConfig', {
  method: 'GET', // http method to use for ajax search call
  idField: 'id', // the id field of the option object
  textField: 'text', // the text field of the option object
  placeholder: 'Select an option', // the placeholder to show on the input
  multiple: false, // allow multiple options to be selected
  multiPlaceholder: 'Click to select an option', // placeholder to show on multi select input
  searchPlaceholder: 'Search...', // placeholder to show on dropdown search input
  searchHelpText: 'Enter $$ or more characters...', // Help text to show in dropdown as a user types in the search input ($$ gets replaced by the number of "minSearchChars" required to issue a search call
  minSearchChars: 2, // minimum number of characters to require before making a search request
  url: '', // the url to call for a search request
  emptyText: 'No options found' // text to show in the dropdown when no results are found
})

/**
 * ez-select directive
 *
 * Usage:
 * <ez-select selected="form.selectedOptions" options="availableOptions" data-multiple="true"></ez-select>
 */
.directive('ezSelect', ['ezSelectConfig', '$document', '$timeout', '$q', '$http', 'object2arrayFilter', 'filterFilter', 'orderByFilter', function (ezSelectConfig, $document, $timeout, $q, $http, object2arrayFilter, filterFilter, orderByFilter) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      options: '=?options',
      selected: '=?selected',
      config: '=?config'
    },
    templateUrl: 'ez-select-tpl.html',
    compile: function(element, attrs) {

      // determine the max chars that will fit in the widget
      var $toggle = element.find('.ez-select-toggle');
      var maxChars = $toggle.width() / (parseFloat($toggle.css('font-size'), 10) * 0.5);

      var config = angular.extend({}, ezSelectConfig);

      // resolve config set in attrs
      angular.forEach(Object.keys(ezSelectConfig), function(key) {
        if (typeof attrs[key] !== 'undefined') {
          config[key] = attrs[key];
        }
      });

      return function (scope, element) {
        // merge scope config with the rest of the config
        scope.config = angular.extend(config, scope.config);

        scope.showDropdown = false;
        scope.emptyText = config.emptyText;
        scope.query = ''; // used for filtering
        scope.form = {query: ''}; // used for ajax requests

        if (typeof scope.options === 'undefined') {
          scope.options = [];
        }

        if (typeof scope.selected === 'undefined') {
          scope.selected = (scope.config.multiple ? [] : '');
        }

        if (!!scope.config.url) {
          scope.ajaxSearch = true;
          scope.showSearchInput = true;
        } else {
          scope.ajaxSearch = false;
          scope.showSearchInput = !!scope.config.search;
        }

        /**
         * Filters & sorts the options available in the dropdown list
         */
        scope.filter = function() {
          scope._options = object2arrayFilter(scope.options);

          scope._options = orderByFilter(scope._options, ['-_selected', scope.config.textField]);

          if (scope.query) {
            scope._options = filterFilter(scope._options, {text: scope.query});
          }

          // update emptyText
          if (scope.ajaxSearch) {
            if (scope.form.query.length < scope.config.minSearchChars) {
              scope.emptyText = scope.config.searchHelpText.replace('$$', (parseInt(scope.config.minSearchChars, 10) - scope.form.query.length));
            } else if (!scope._options.length) {
              scope.emptyText = scope.config.emptyText;
            } else {
              scope.emptyText = false;
            }
          } else {
            if (!scope._options.length) {
              scope.emptyText = scope.config.emptyText;
            } else {
              scope.emptyText = false;
            }
          }
        };

        /**
         * Close the dropdown menu and unbind click listener
         */
        scope.closeDropdown = function(e) {
          if (typeof e !== 'undefined') {
            if ($(e.target).parents('.ez-select-container').get(0) === element.get(0)) {
              return false;
            }
            scope.showDropdown = false;
            scope.$apply();
          } else {
            scope.showDropdown = false;
          }

          $document.unbind('click', scope.closeDropdown);
        };

        /**
         * Open dropdown menu
         */
        scope.open = function(e) {
          if (!scope.showDropdown) {
            scope.showDropdown = true;
            $document.click(scope.closeDropdown);
          } else {
            scope.closeDropdown(e);
          }
        };

        /**
         * Select an option via the dropdown and update the selected options on the scope
         */
        scope.select = function(e, option) {
          e.preventDefault();
          e.stopPropagation();

          if (!option._selected) {
            scope.$emit('ez_select.select', option);
            if (scope.config.multiple) {
              scope.selected.push(option[scope.config.idField]);
            } else {
              scope.selected = option[scope.config.idField];
            }
          } else {
            scope.$emit('ez_select.unselect', option);
            if (scope.config.multiple) {
              var i = scope.selected.indexOf(option[scope.config.idField]);
              if (i !== -1) {
                scope.selected.splice(i, 1);
              }
            } else {
              scope.selected = '';
            }
          }

          if (!scope.config.multiple) {
            scope.closeDropdown();
          }
        };

        /**
         * Update the selected options text
         */
        scope.updateText = function() {
          var str = '';

          if (scope.config.multiple) {
            angular.forEach(scope.selected, function(selectedOption) {
              angular.forEach(scope.options, function(option) {
                if (selectedOption[scope.config.idField] === option[scope.config.idField]) {
                  str += option[scope.config.textField] + ', ';
                }
              });
            });
            str = str.slice(0, -2);
          } else {
            angular.forEach(scope.options, function(option) {
              if (option[scope.config.idField] === scope.selected) {
                str += option[scope.config.textField];
              }
            });
          }

          if (!str) {
            str = scope.config.placeholder;
          } else if (str.length > maxChars) { // do not allow for text to expand the widgets width
            if (scope.config.multiple) {
              str = scope.selected.length + ' selected';
            } else {
              str = '1 selected';
            }
          }

          scope.selectedText = str;
        };

        /**
         * Watch query model and call search if changed
         * Cancel any previous requests
         */
        var req;
        var canceler = $q.defer();
        scope.$watch('form.query', function(newVal, oldVal) {
          if (scope.ajaxSearch) {
            if (newVal && newVal !== oldVal && newVal.length >= scope.config.minSearchChars) {
              if (req === true)  {
                canceler.resolve();
                canceler = $q.defer();
              }
              req = true;

              $http({
                method: scope.config.method,
                url: scope.config.url,
                params: {q: newVal},
                timeout: canceler.promise
              }).success(function(data) {
                req = false;
                scope.options = data;
                scope.filter();
              }).error(function(e) {
                scope.$broadcast('ez-select.error.search', e);
              });

            } else {
              scope.options = {};
              scope.filter();
            }
          } else {
            scope.query = newVal;
            scope.filter();
          }
        });

        /**
         * Watch selected array and update the _selected variable on the options
         */
        scope.$watchCollection('selected', function(newVal) {
          if (scope.config.multiple) {
            angular.forEach(scope.options, function(v) {
              if (newVal.indexOf(v[scope.config.idField]) !== -1) {
                v._selected = true;
              } else {
                v._selected = false;
              }
            });
          } else {
            angular.forEach(scope.options, function(v) {
              if (newVal === v[scope.config.idField]) {
                v._selected = true;
              } else {
                v._selected = false;
              }
            });
          }

          scope.updateText();
          scope.filter();
        });
      };
    }
  };

}]);

