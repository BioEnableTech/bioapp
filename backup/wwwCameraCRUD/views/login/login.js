// login.js
// This is the controller that handles the logging in of the user through Firebase ONLY.
// This is the LITE version and logging in through Social accounts is not supported. Purchase the FULL version at http://bit.ly/2ad466m
// Intelligent Login System is also not available on the Lite version.
// Intelligent Login System is a mechanism placed that if the user is previously logged in and the app is closed, the user is automatically logged back in whenever the app is reopened.
'Use Strict';
angular.module('App').controller('loginController', function($scope, $state, $localStorage, Utils, Popup) {
  $scope.$on('$ionicView.enter', function() {
    //Clear the Login Form.
    $scope.user = {
      email: '',
      password: ''
    };
  })

  $scope.login = function(user) {
    if (angular.isDefined(user)) {
      Utils.show();
      loginWithFirebase(user.email, user.password);
    }
  };

  $scope.showNotSupported = function() {
    Utils.message(Popup.errorIcon, Popup.fullVersionOnly);
  }

  $scope.showFullVersion = function() {
    window.open('http://bit.ly/2ad466m', '_system', 'location=no');
  }

  $scope.rate = function() {
    window.open('http://bit.ly/29QTiHF', '_system', 'location=no');
  }

  $scope.donate = function() {
    window.open('http://bit.ly/2as73xB', '_system', 'location=no');
  }

  $scope.ionWalkRate = function() {
    window.open('http://bit.ly/2a7Lxzn', '_system', 'location=no');
  }

  $scope.buy = function() {
    window.open('http://bit.ly/2adbYWc', '_system', 'location=no');
  }

  $scope.ionPlay = function() {
    window.open('http://bit.ly/2aLTIz5', '_system', 'location=no');
  }

  //Function to login to Firebase using email and password.
  loginWithFirebase = function(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function(response) {
        //Retrieve the account from the Firebase Database
        var userId = firebase.auth().currentUser.uid;
        firebase.database().ref('accounts').orderByChild('userId').equalTo(userId).once('value').then(function(accounts) {
          if (accounts.exists()) {
            accounts.forEach(function(account) {
              //Account already exists, proceed to home.
              Utils.hide();
              firebase.database().ref('accounts/' + account.key).on('value', function(response) {
                var account = response.val();
                $localStorage.account = account;
              });
              $state.go('home');
            });
          }
        });
        $localStorage.loginProvider = "Firebase";
        $localStorage.email = email;
        $localStorage.password = password;
      })
      .catch(function(error) {
        var errorCode = error.code;
        showFirebaseLoginError(errorCode);
      });
  }

  //Shows the error popup message when using the Login with Firebase.
  showFirebaseLoginError = function(errorCode) {
    switch (errorCode) {
      case 'auth/user-not-found':
        Utils.message(Popup.errorIcon, Popup.emailNotFound);
        break;
      case 'auth/wrong-password':
        Utils.message(Popup.errorIcon, Popup.wrongPassword);
        break;
      case 'auth/user-disabled':
        Utils.message(Popup.errorIcon, Popup.accountDisabled);
        break;
      case 'auth/too-many-requests':
        Utils.message(Popup.errorIcon, Popup.manyRequests);
        break;
      default:
        Utils.message(Popup.errorIcon, Popup.errorLogin);
        break;
    }
  };

});
