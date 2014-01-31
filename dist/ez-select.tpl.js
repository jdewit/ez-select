angular.module('ez.select').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ez-select.tpl.html',
    "<div class=\"ez-select dropdown\"> \n" +
    "  <div ng-click=\"open($event)\">\n" +
    "    <a class=\"btn btn-default ez-select-toggle\" ng-if=\"!multiple\">\n" +
    "      <span class=\"text\">{{ selectedText }}</span>\n" +
    "      <span class=\"caret\"></span>\n" +
    "    </a>\n" +
    "    <ul class=\"tag-container\" ng-if=\"multiple\">\n" +
    "      <li ng-repeat=\"option in selectedOptions\">\n" +
    "        <a ng-click=\"select($event, option)\"><i class=\"glyphicon glyphicon-remove\"></i></a>\n" +
    "        <span class=\"text\">{{ option.text }}</span>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "  <div class=\"dropdown-menu\">\n" +
    "    <div class=\"search-box\" ng-show=\"options.length > 10\">\n" +
    "      <input ng-model=\"form.query\" type=\"text\" placeholder=\"Search options...\" class=\"input-block-level form-control\">\n" +
    "    </div>\n" +
    "    <ul>\n" +
    "      <li ng-repeat=\"option in _options\" ng-class=\"{selected: option._selected}\">\n" +
    "        <a ng-click=\"select($event, option)\">\n" +
    "          <span class=\"text\">{{ option.text }}</span>\n" +
    "          <i ng-show=\"option._selected\" class=\"selected glyphicon glyphicon-ok\"></i>\n" +
    "        </a>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
