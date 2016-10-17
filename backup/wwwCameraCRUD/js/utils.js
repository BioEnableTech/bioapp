angular.module('App').factory('Utils', function($ionicLoading, $ionicPopup, $timeout, Popup) {
  var promise;
  var Utils = {
    show: function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="ripple"></ion-spinner>'
      });
    },
    hide: function() {
      $ionicLoading.hide();
    },
    message: function(icon, message) {
      $ionicLoading.show({
        template: '<div class="message-popup" onclick="hideMessage()"><h1><i class="icon ' + icon + '"></i></h1><p>' + message + '</p></div>',
        scope: this
      });
      promise = $timeout(function() {
        $ionicLoading.hide();
      }, Popup.delay);
      return promise;
    },
    confirm: function(icon, message) {
      var popup = $ionicPopup.confirm({
        cssClass: 'message-confirm',
        title: '<i class="icon ' + icon + '"></i>',
        template: message,
        buttons: [{
          text: '<i class="icon ion-close"></i>',
          type: 'button-confirm',
          onTap: function(e) {
            return false;
          }
        }, {
          text: '<i class="icon ion-checkmark"></i>',
          type: 'button-confirm',
          onTap: function(e) {
            return true;
          }
        }]
      });
      return popup;
    }
  };

  hideMessage = function() {
    $timeout.cancel(promise);
    $ionicLoading.hide();
  };

  return Utils;
});
