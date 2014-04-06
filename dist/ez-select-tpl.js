angular.module('ez.select').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ez-select-tpl.html',
    "<div class=\"ez-select-container\" ng-class=\"{open: showDropdown}\"> \n" +
    "  <span class=\"caret\"></span>\n" +
    "  <a class=\"btn btn-default ez-select-toggle\" ng-click=\"open($event)\" ng-class=\"{placeholder: !selected.length}\" ng-if=\"!multiple\">\n" +
    "    <span class=\"text\">{{ selectedText }}</span>\n" +
    "  </a>\n" +
    "  <ul class=\"tag-container\" ng-click=\"open($event)\" ng-if=\"multiple\">\n" +
    "    <li ng-repeat=\"option in options | filter:{_selected:true}\">\n" +
    "      <a ng-click=\"select($event, option)\"><i class=\"glyphicon glyphicon-remove\"></i></a>\n" +
    "      <span class=\"text\">{{ option[textField] }}</span>\n" +
    "    </li>\n" +
    "    <li class=\"placeholder\" ng-if=\"!selected.length\">\n" +
    "      {{ multiPlaceholder }}\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "  <div class=\"dropdown-menu\">\n" +
    "    <div class=\"search-box\" ng-show=\"showSearchInput\">\n" +
    "      <input ng-model=\"form.query\" type=\"text\" placeholder=\"{{ searchPlaceholder }}\" class=\"search-input input-block-level form-control\">\n" +
    "    </div>\n" +
    "    <ul>\n" +
    "      <li ng-repeat=\"option in _options\" ng-class=\"{selected: option._selected}\">\n" +
    "        <a ng-click=\"select($event, option)\">\n" +
    "          <span class=\"text\">{{ option[textField] }}</span>\n" +
    "          <i ng-show=\"option._selected\" class=\"selected glyphicon glyphicon-ok\"></i>\n" +
    "        </a>\n" +
    "      </li>\n" +
    "      <li ng-if=\"emptyText\">\n" +
    "        <a>{{ emptyText }}</a>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
