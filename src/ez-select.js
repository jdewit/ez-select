'use strict';

angular.module('ez.select', ['ez.object2array'])

.constant('ezSelectConfig', {
  method: 'GET',
  idField: 'id',
  textField: 'text',
  placeholder: 'Select an option',
  multiPlaceholder: 'Click to select an option',
  searchPlaceholder: 'Search...',
  searchHelpText: 'Enter $$ or more characters...',
  minSearchChars: 2,
  emptyText: 'No options found'
})

.directive('ezSelect', ['ezSelectConfig', '$document', '$timeout', '$q', '$http', 'object2arrayFilter', 'filterFilter', 'orderByFilter', function (ezSelectConfig, $document, $timeout, $q, $http, object2arrayFilter, filterFilter, orderByFilter) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      options: '=?options',
      selected: '=?selected'
    },
    templateUrl: 'ez-select-tpl.html',
    compile: function(element, attrs) {

      var $toggle = element.find('.ez-select-toggle');
      var fontSize = parseFloat($toggle.css('font-size'), 10);
      var maxChars = $toggle.width() / (fontSize * 0.5);
      var method = attrs.method || ezSelectConfig.method;
      var emptyText = attrs.emptyText || ezSelectConfig.emptyText;
      var searchHelpText = attrs.searchHelpText || ezSelectConfig.searchHelpText;
      var minSearchChars = attrs.minSearchChars || ezSelectConfig.minSearchChars;

      return function (scope, element, attrs) {
        scope.showDropdown = false;
        scope.multiple = !!attrs.multiple;
        scope.placeholder = attrs.placeholder || ezSelectConfig.placeholder;
        scope.multiPlaceholder = attrs.multiPlaceholder || ezSelectConfig.multiPlaceholder;
        scope.searchPlaceholder = attrs.searchPlaceholder || ezSelectConfig.searchPlaceholder;
        scope.idField = attrs.idField || ezSelectConfig.idField;
        scope.textField = attrs.textField || ezSelectConfig.textField;
        scope.emptyText = emptyText;
        scope.query = ''; // used for filtering
        scope.form = {query: ''}; // used for ajax requests

        if (typeof scope.options === 'undefined') {
          scope.options = [];
        }

        if (typeof scope.selected === 'undefined') {
          scope.selected = (scope.multiple ? [] : '');
        }

        if (!!attrs.url) {
          scope.ajaxSearch = true;
          scope.showSearchInput = true;
        } else {
          scope.ajaxSearch = false;
          scope.showSearchInput = !!attrs.search;
        }

        scope.filter = function() {
          scope._options = object2arrayFilter(scope.options);

          scope._options = orderByFilter(scope._options, ['-_selected', 'text']);

          if (scope.query) {
            scope._options = filterFilter(scope._options, {text: scope.query});
          }

          // update emptyText
          if (scope.ajaxSearch) {
            if (scope.form.query.length < minSearchChars) {
              scope.emptyText = searchHelpText.replace('$$', (parseInt(minSearchChars, 10) - scope.form.query.length));
            } else if (!scope._options.length) {
              scope.emptyText = emptyText;
            } else {
              scope.emptyText = false;
            }
          } else {
            if (!scope._options.length) {
              scope.emptyText = emptyText;
            } else {
              scope.emptyText = false;
            }
          }
        };

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
            $timeout(function() {
              element.find('.search-input').trigger('focus');
            });
            $document.click(scope.closeDropdown);
          } else {
            scope.closeDropdown(e);
          }
        };

        /**
         * select an option via the dropdown
         */
        scope.select = function(e, option) {
          e.preventDefault();
          e.stopPropagation();

          if (!option._selected) {
            scope.$emit('ez_select.select', option);
            if (scope.multiple) {
              scope.selected.push(option[scope.idField]);
            } else {
              scope.selected = option[scope.idField];
            }
          } else {
            scope.$emit('ez_select.unselect', option);
            if (scope.multiple) {
              var i = scope.selected.indexOf(option[scope.idField]);
              if (i !== -1) {
                scope.selected.splice(i, 1);
              }
            } else {
              scope.selected = '';
            }
          }

          if (!scope.multiple) {
            scope.closeDropdown();
          }
        };

        /**
         * Update the selected options text
         */
        scope.updateText = function() {
          var str = '';

          if (scope.multiple) {
            angular.forEach(scope.selected, function(selectedOption) {
              angular.forEach(scope.options, function(option) {
                if (selectedOption[scope.idField] === option[scope.idField]) {
                  str += option[scope.textField] + ', ';
                }
              });
            });
            str = str.slice(0, -2);
          } else {
            angular.forEach(scope.options, function(option) {
              if (option[scope.idField] === scope.selected) {
                str += option[scope.textField];
              }
            });
          }

          if (!str) {
            str = scope.placeholder;
          } else if (str.length > maxChars) { // do not allow for text to expand the widgets width
            if (scope.multiple) {
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
            if (newVal && newVal !== oldVal && newVal.length >= minSearchChars) {
              if (req === true)  {
                canceler.resolve();
                canceler = $q.defer();
              }
              req = true;

              $http({
                method: method,
                url: attrs.url,
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
          if (scope.multiple) {
            angular.forEach(scope.options, function(v) {
              if (newVal.indexOf(v[scope.idField]) !== -1) {
                v._selected = true;
              } else {
                v._selected = false;
              }
            });
          } else {
            angular.forEach(scope.options, function(v) {
              if (newVal === v[scope.idField]) {
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

