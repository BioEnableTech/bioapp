// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js




angular.module('app', ['ionic',  'ngStorage', 'ngCordova','app.controllers', 'app.routes', 'app.services', 'app.directives', 'firebase','ngSanitize' ])


 .constant('Popup', {
    delay: 3000, //How long the popup message should show before disappearing (in milliseconds -> 3000 = 3 seconds).
    successIcon: "ion-happy-outline",
    errorIcon: "ion-sad-outline",
    accountCreateSuccess: "Congratulations! Your account has been created. Logging you in.",
    emailAlreadyExists: "Sorry, but an account with that email address already exists. Please register with a different email and try again.",
    accountAlreadyExists: "Sorry, but an account with the same credential already exists. Please check your account and try again.",
    emailNotFound: "Sorry, but we couldn\'t find an account with that email address. Please check your email and try again.",
    userNotFound: "Sorry, but we couldn\'t find a user with that account. Please check your account and try again.",
    invalidEmail: "Sorry, but you entered an invalid email. Please check your email and try again.",
    notAllowed: "Sorry, but registration is currently disabled. Please contact support and try again.",
    serviceDisabled: "Sorry, but logging in with this service is current disabled. Please contact support and try again.",
    wrongPassword: "Sorry, but the password you entered is incorrect. Please check your password and try again.",
    accountDisabled: "Sorry, but your account has been disabled. Please contact support and try again.",
    weakPassword: "Sorry, but you entered a weak password. Please enter a stronger password and try again.",
    errorRegister: "Sorry, but we encountered an error registering your account. Please try again later.",
    passwordReset: "A password reset link has been sent to: ",
    errorPasswordReset: "Sorry, but we encountered an error sending your password reset email. Please try again later.",
    errorLogout: "Sorry, but we encountered an error logging you out. Please try again later.",
    sessionExpired: "Sorry, but the login session has expired. Please try logging in again.",
    errorLogin: "Sorry, but we encountered an error logging you in. Please try again later.",
    welcomeBack: "Welcome back! It seems like you should still be logged in. Logging you in now.",
    manyRequests: "Sorry, but we\'re still proccessing your previous login. Please try again later.",
    fullVersionOnly: "Sorry, but this feature is not available on the Lite version. Upgrade to Full version in order to use Social Login.",
    uploadImageError: "Sorry, we\'ve encountered an error uploading your image to Firebase. Try again later.",
    productAddSuccess: "Congratulations! Your product has been successfully added.",
    productEditSuccess: "Congratulations! Your product has been successfully updated."
  })


.config(function($ionicConfigProvider) {
    //Added config
    //$ionicConfigProvider.views.maxCache(5);
    $ionicConfigProvider.scrolling.jsScrolling(false);
    $ionicConfigProvider.tabs.position('bottom'); // other values: top
})
.run(function($ionicPlatform,$rootScope) {

    $rootScope.extras = false;

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
