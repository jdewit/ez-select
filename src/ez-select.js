'use strict';

angular.module('ez.select', ['ez.object2array'])

.constant('ezSelectConfig', {
  textField: 'text',
  idField: 'id',
})

.directive('ezSelect', ['ezSelectConfig', '$document', 'object2arrayFilter', 'filterFilter', 'orderByFilter', function (ezSelectConfig, $document, object2arrayFilter, filterFilter, orderByFilter) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      options: '=options',
      selectedId: '=selectedId',
      selectedIds: '=selectedIds',
      selectedOption: '=selectedOption',
      selectedOptions: '=selectedOptions',
      search: '=search'
    },
    templateUrl: 'ez-select.tpl.html',
    compile: function(element, attrs) {

      var $toggle = element.find('.ez-select-toggle');
      var fontSize = parseFloat($toggle.css('font-size'), 10);
      var maxChars = $toggle.width() / (fontSize * 0.5);

      var closeDropdown = function(e) {
        if (!$(e.target).is('input')) { // dont close on search input click
          $document.unbind('click', closeDropdown);
          element.removeClass('open');
        }
      };

      return function (scope, element, attrs) {
        scope._options = {};

        console.log(attrs.hasOwnProperty('selectedId'));

        if (typeof scope.search === 'function') {
          scope.ajaxSearch = true;
          scope.showSearch = true;
        } else {
          scope.showSearch = !!scope.search;
        }

        scope.open = function(e) {
          e.preventDefault();
          e.stopPropagation();

          element.addClass('open');
          element.find('.search-box input').trigger('focus');
          $document.click(closeDropdown);
        };

        /**
         * select an option via the dropdown
         */
        scope.select = function(e, option) {
          e.preventDefault();
          e.stopPropagation();

          if (scope.multiple) {
            if (!option._selected) {
              option._selected = true;
              scope.selectedIds.push(option.id);
            } else {
              option._selected = null;
              scope.selectedIds.splice(scope.selectedIds.indexOf(option.id), 1);
            }
          } else {
            scope.selected = option.id;
            closeDropdown(e);
          }

          scope.updateText();
        };

        /**
         * Update the selected options text
         */
        scope.updateText = function() {
          var str = '';

          if (scope.selected) {
            if (scope.multiple) {
              if (scope.selected.length) {
                for (var s in scope.selected) {
                  str += scope.options[s].text + ', ';
                }
                str = str.slice(0, -2);
              }
            } else {
              str = scope._options[scope.selected].text;
            }
          }

          if (!str) {
            str = 'Select an option';
          } else if (str.length > maxChars) { // dont allow for text to expand the widgets width
            if (scope.multiple) {
              str = scope.selected.length + ' selected';
            } else {
              str = '1 selected';
            }
          }

          scope.selectedText = str;
        };

        scope.filter = function(query) {
          //if (query) {
            //scope._options = filterFilter(scope.options, query);
          //} else {
            //scope._options = scope.options;
          //}

          //scope._options = orderByFilter(orderByFilter(scope._options, ezSelectConfig.textField, true), '_selected', true);
        };

        /**
         * Watch query model and call search if changed
         */
        scope.$watch('form.query', function(newVal, oldVal) {
          if (scope.searchEnabled) {
            if (newVal && newVal.length > 0 && newVal !== oldVal) {
              scope._options = {};
              scope.search(newVal).then(function(res) {
                scope._options = res.data;
              });
            } else {
              for (var k in scope.options) {
                scope._options[scope.options[k].id] = scope.options[k];
              }
            }
          } else {
            scope.filter(newVal);
          }
        });

        /**
         * Keep options insync with directives _options
         */
        scope.$watch('options', function(newVal, oldVal) {
          scope.updateText();
        });

        /**
         * Watch selected array and update the _selected variable on the options
         */
        scope.$watchCollection('selected', function(newVal, oldVal) {
          // remove
          //for (var k in oldVal) {

          //}

          //for (var k in newVal) {

          //}
            //angular.forEach(scope.options, function(option, i) {
              //if (multiple) {
                //if (scope.selected.indexOf(option.id) !== -1) {
                  //if (scope.selectedOptions.indexOf(option) === -1) {
                    //scope.selectedOptions.push(option);
                  //}
                  //option._selected = true;
                //} else {
                  //var index = scope.selectedOptions.indexOf(option);
                  //if (index !== -1) {
                    //scope.selectedOptions.splice(index, 1);
                  //}
                  //option._selected = false;
                //}
              //} else {
                //if (scope.selected === option.id) {
                  //scope.selectedOptions = [option];
                  //option._selected = true;
                //} else {
                  //option._selected = false;
                //}
                //scope.updateText();
              //}
            //});
        });
      };
    }
  };

}]);

