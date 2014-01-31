'use strict';

angular.module('ez.select', [])

.constant('ezSelectConfig', {
  textField: 'text',
  idField: 'id',
})

.directive('ezSelect', ['ezSelectConfig', '$document', 'filterFilter', 'orderByFilter', function (ezSelectConfig, $document, filterFilter, orderByFilter) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      options: '=options',
      selected: '=selected',
      search: '=search'
    },
    templateUrl: 'ez-select.tpl.html',
    compile: function(element, attrs) {

      var $toggle = element.find('.ez-select-toggle');
      var fontSize = parseFloat($toggle.css('font-size'), 10);
      var maxChars = $toggle.width() / (fontSize * 0.5);
      var multiple = !!attrs.multiple;

      var closeDropdown = function(e) {
        $document.unbind('click', closeDropdown);
        element.removeClass('open');
      };

      return function (scope, element, attrs) {
        scope._options = [];
        scope.selectedOptions = [];
        scope.multiple = multiple;

        scope.open = function(e) {
          e.preventDefault();
          e.stopPropagation();

          element.addClass('open');
          element.find('.search-box input').trigger('focus');
          $document.click(closeDropdown);
        };

        scope.select = function(e, option) {
          e.preventDefault();
          e.stopPropagation();

          if (multiple) {
            if (!option._selected) {
              scope.selected.push(option.id);
            } else {
              scope.selected.splice(scope.selected.indexOf(option.id), 1);
            }
          } else {
            scope.selected = option.id;
            closeDropdown();
          }
        };

        scope.updateText = function() {
          var str = '';
          var count = 0;

          angular.forEach(scope.options, function(option, i) {
            if (scope.selected.indexOf(option.id) !== -1) {
              str += option[ezSelectConfig.textField] + ', ';
              count++;
            }
          });

          if (!str) {
            str = 'Select an option';
          } else if (str.length > maxChars) { // dont allow for text to expand the widgets width
            str = count + ' selected';
          } else {
            str = str.slice(0, -2);
          }

          scope.selectedText = str;
        };

        scope.filter = function(query) {
          if (query) {
            scope._options = filterFilter(scope.options, query);
          } else {
            scope._options = scope.options;
          }

          scope._options = orderByFilter(orderByFilter(scope._options, ezSelectConfig.textField, true), '_selected', true);
        };

        scope.$watch('form.query', function(newVal, oldVal) {
          if (scope.search && newVal && newVal.length > 0 && newVal !== oldVal) {
            scope.search(newVal).then(function(data) {
              angular.forEach(data, function(option) {
                if (scope.options.indexOf(option) === -1) {
                  option._selected = false;
                  scope.options.push(option);
                }
              });
              scope.filter(newVal);
            });
          } else {
            scope.filter(newVal);
          }
        });

        scope.$watchCollection('selected', function(newVal, oldVal) {
            angular.forEach(scope.options, function(option, i) {
              if (multiple) {
                if (scope.selected.indexOf(option.id) !== -1) {
                  if (scope.selectedOptions.indexOf(option) === -1) {
                    scope.selectedOptions.push(option);
                  }
                  option._selected = true;
                } else {
                  var index = scope.selectedOptions.indexOf(option);
                  if (index !== -1) {
                    scope.selectedOptions.splice(index, 1);
                  }
                  option._selected = false;
                }
              } else {
                if (scope.selected === option.id) {
                  console.log('match!');
                  scope.selectedOptions = [option];
                  option._selected = true;
                } else {
                  option._selected = false;
                }
                scope.updateText();
              }
            });
        });
      };
    }
  };

}]);

