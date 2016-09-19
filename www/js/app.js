// Ionic Starter App
var config = {
    apiKey: "AIzaSyDIsZMLidydryGtwLqnFfuKT5iMhFE91KU",
    authDomain: "project1-9ad07.firebaseapp.com",
    databaseURL: "https://project1-9ad07.firebaseio.com",
    storageBucket: "project1-9ad07.appspot.com",
  };
  
/* var config = {
    apiKey: "AIzaSyBbqAN83AIaCvjTPLlLK8hkHoeL_qgBcqs",
    authDomain: "ngechat-d4fce.firebaseapp.com",
    databaseURL: "https://ngechat-d4fce.firebaseio.com",
    storageBucket: "ngechat-d4fce.appspot.com",
};
*/

var mainApp = firebase.initializeApp(config);
var auth = firebase.auth();
var rootRef = firebase.database().ref();
var displayNames = 'noname';

function onDeviceReady() {
    angular.bootstrap(document, ["starter"]);
}

// Registering onDeviceReady callback with deviceready event
document.addEventListener("deviceready", onDeviceReady, false);
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'angularMoment', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $rootScope, $location, Auth, $ionicLoading) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        // To Resolve Bug
       // $ionicPlatform.fullScreen();

        Auth.onAuthStateChanged(function(authData) {
            if (authData) {
                console.log("Logged in as:", authData.uid);
            } else {
                $ionicLoading.hide();
                $location.path('/login');
            }
        });


        $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the home page
            if (error === "AUTH_REQUIRED") {
                $location.path("/login");
            }
        });
    });
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

    // State to represent Login View
        .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl',
        resolve: {
            // controller will not be loaded until $waitForAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function(Auth) {
                    return Auth;
                }
            ]
        }
    })

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl',
        resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function(Auth) {
                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth;
                }
            ]
        }
    })


    // Each tab has its own nav history stack:

    .state('app.rooms', {
        url: '/rooms',
        views: {
            'menuContent': {
                templateUrl: 'templates/rooms.html',
                controller: 'RoomsCtrl'
            }
        }
    })

    .state('app.signout', {
        url: '/signout',
        views: {
            'menuContent': {
                templateUrl: 'templates/signout.html',
                controller: 'SignoutCtrl'
            }
        }
    })

    .state('app.chat', {
        url: '/chat/:roomId',
        views: {
            'menuContent': {
                templateUrl: 'templates/chat.html',
                controller: 'ChatCtrl'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});