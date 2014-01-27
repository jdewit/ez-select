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
      selectedOptionIds: '=selectedOptionIds',
      search: '=search'
    },
    templateUrl: 'ez-select.tpl.html',
    compile: function(element, attrs) {

      var $toggle = element.find('.ez-select-toggle');
      var fontSize = parseFloat($toggle.css('font-size'), 10);
      var maxChars = $toggle.width() / (fontSize * 0.5);
      var multiple = !!attrs.multiple;

      return function (scope, element, attrs) {
        scope._options = [];
        scope.selectedOptions = [];
        scope.multiple = multiple;

        var closeDropdown = function(e) {
          if (!$(e.target).parents('.ez-select').get(0)) {
            $document.unbind('click', closeDropdown);
            element.removeClass('open');
          }
        };

        scope.open = function() {
          element.addClass('open');
          element.find('.search-box input').trigger('focus');
          $document.click(closeDropdown);
        };

        scope.select = function(option) {
          if (!option._selected) {
            scope.selectedOptionIds.push(option.id);
            scope.selectedOptions.push(option);
          } else {
            var i = scope.selectedOptionIds.indexOf(option.id);

            if (i !== -1) {
              scope.selectedOptionIds.splice(i, 1);
              scope.selectedOptions.splice(i, 1);
            }
          }
          scope.filter();
          scope.updateText();
        };

        scope.updateText = function() {
          var str = '';
          var count = 0;

          angular.forEach(scope.options, function(option, i) {
            if (scope.selectedOptionIds.indexOf(option.id) !== -1) {
              option._selected = true;
              str += option[ezSelectConfig.textField] + ', ';
              count++;
            } else {
              option._selected = false;
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

        // init
        scope.updateText();
        angular.forEach(scope.options, function(option) {
          if (scope.selectedOptionIds.indexOf(option.id) !== -1) {
            scope.selectedOptions.push(option);
          }
        });
      };
    }
  };

}]);

