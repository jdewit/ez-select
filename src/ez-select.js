'use strict';

angular.module('ez.select', ['ez.object2array'])

.constant('ezSelectConfig', {
  method: 'GET',
  placeholder: 'Select an option'
})

.directive('ezSelect', ['ezSelectConfig', '$document', '$q', '$http', 'object2arrayFilter', 'filterFilter', 'orderByFilter', function (ezSelectConfig, $document, $q, $http, object2arrayFilter, filterFilter, orderByFilter) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      options: '=options',
      selected: '=selected',
      search: '=search'
    },
    templateUrl: 'ez-select-tpl.html',
    compile: function(element, attrs) {

      var $toggle = element.find('.ez-select-toggle');
      var fontSize = parseFloat($toggle.css('font-size'), 10);
      var maxChars = $toggle.width() / (fontSize * 0.5);
      var method = attrs.method || ezSelectConfig.method;
      var placeholder = attrs.placeholder || ezSelectConfig.placeholder;

      var closeDropdown = function(e) {
        if (!$(e.target).is('input')) { // dont close on search input click
          $document.unbind('click', closeDropdown);
          element.removeClass('open');
        }
      };

      return function (scope, element, attrs) {
        scope.query = '';
        scope.multiple = !!attrs.multiple;
        scope._options = [];

        if (!!attrs.url) {
          scope.ajaxSearch = true;
          scope.showSearchInput = true;
        } else {
          scope.showSearchInput = !!scope.search;
        }

        scope.filter = function() {
          scope._options = object2arrayFilter(scope.options);

          scope._options = orderByFilter(scope._options, ['-_selected', 'text']);

          if (scope.query) {
            scope._options = filterFilter(scope._options, {text: scope.query});
          }
        };

        /**
         * Open dropdown menu
         */
        scope.open = function(e) {
          e.preventDefault();
          e.stopPropagation();

          if (!element.hasClass('open')) {
            element.addClass('open');
            element.find('.search-box input').trigger('focus');
            $document.click(closeDropdown);
          } else {
            closeDropdown(e);
          }
        };

        /**
         * select an option via the dropdown
         */
        scope.select = function(e, option) {
          e.preventDefault();
          e.stopPropagation();

          if (!option._selected) {
            if (scope.multiple) {
              scope.selected.push(option.id);
            } else {
              scope.selected = option.id;
            }
          } else {
            if (scope.multiple) {
              var i = scope.selected.indexOf(option.id);
              if (i !== -1) {
                scope.selected.splice(i, 1);
              }
            } else {
              scope.selected = '';
            }
          }

          if (!scope.multiple) {
            closeDropdown(e);
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
                if (selectedOption.id === option.id) {
                  str += option.text + ', ';
                }
              });
            });
            str = str.slice(0, -2);
          } else {
            angular.forEach(scope.options, function(option) {
              if (option.id === scope.selected) {
                str += option.text;
              }
            });
          }

          if (!str) {
            str = placeholder;
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
        var canceler = $q.defer();
        var req;
        scope.$watch('form.query', function(newVal, oldVal) {
          if (scope.ajaxSearch) {
            if (newVal && newVal !== oldVal) {
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
        scope.$watchCollection('selected', function(newVal, oldVal) {
          if (scope.multiple) {
            angular.forEach(scope.options, function(v) {
              if (newVal.indexOf(v.id) !== -1) {
                v._selected = true;
              } else {
                v._selected = false;
              }
            });
          } else {
            angular.forEach(scope.options, function(v) {
              if (newVal === v.id) {
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

