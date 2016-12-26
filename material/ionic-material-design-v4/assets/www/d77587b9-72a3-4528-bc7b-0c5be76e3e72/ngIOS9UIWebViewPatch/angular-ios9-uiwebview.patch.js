/**
 * ==================  angular-ios9-uiwebview.patch.js v1.1.1 ==================
 *
 * This patch works around iOS9 UIWebView regression that causes infinite digest
 * errors in Angular.
 *
 * The patch can be applied to Angular 1.2.0 – 1.4.5. Newer versions of Angular
 * have the workaround baked in.
 *
 * To apply this patch load/bundle this file with your application and add a
 * dependency on the "ngIOS9UIWebViewPatch" module to your main app module.
 *
 * For example:
 *
 * ```
 * angular.module('myApp', ['ngRoute'])`
 * ```
 *
 * becomes
 *
 * ```
 * angular.module('myApp', ['ngRoute', 'ngIOS9UIWebViewPatch'])
 * ```
 *
 *
 * More info:
 * - https://openradar.appspot.com/22186109
 * - https://github.com/angular/angular.js/issues/12241
 * - https://github.com/driftyco/ionic/issues/4082
 *
 *
 * @license AngularJS
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 */

angular.module('ngIOS9UIWebViewPatch', ['ng']).config(['$provide', function($provide) {
  'use strict';

  $provide.decorator('$browser', ['$delegate', '$window', function($delegate, $window) {

    if (isIOS9UIWebView($window.navigator.userAgent)) {
      return applyIOS9Shim($delegate);
    }

    return $delegate;

    function isIOS9UIWebView(userAgent) {
      return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
    }

    function applyIOS9Shim(browser) {
      var pendingLocationUrl = null;
      var originalUrlFn= browser.url;

      browser.url = function() {
        if (arguments.length) {
          pendingLocationUrl = arguments[0];
          return originalUrlFn.apply(browser, arguments);
        }

        return pendingLocationUrl || originalUrlFn.apply(browser, arguments);
      };

      window.addEventListener('popstate', clearPendingLocationUrl, false);
      window.addEventListener('hashchange', clearPendingLocationUrl, false);

      function clearPendingLocationUrl() {
        pendingLocationUrl = null;
      }

      return browser;
    }
  }]);
}]);
var appControllers = angular.module("starter.controllers", []), appServices = angular.module("starter.services", []);
appControllers.controller("DialogController", ["$scope", "$mdDialog", "displayOption", function (n, t, i) { n.displayOption = i; n.cancel = function () { t.cancel() }; n.ok = function () { t.hide() } }]); appControllers.controller("toastController", ["$scope", "displayOption", function (n, t) { n.displayOption = t }]);
appControllers.directive("numbersOnly", [function () { return { require: "ngModel", link: function (n, t, i, r) { function u(n) { if (n) { var t = n.replace(/[^0-9]/g, ""); return t !== n && (r.$setViewValue(t), r.$render()), t } return undefined } r.$parsers.push(u) } } }]);
appControllers.filter("epochToDate", ["$filter", function () { return function (n) { return new Date(Date(n)) } }]); appControllers.filter("numberSuffix", [function () { return function (n) { var t; return window.isNaN(n) ? 0 : n < 1e3 ? n : (t = Math.floor(Math.log(n) / Math.log(1e3)), (n / Math.pow(1e3, t)).toFixed(1) + ["k", "M", "G", "T", "P", "E"][t - 1]) } }]);