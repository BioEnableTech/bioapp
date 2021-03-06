'Use Strict';
angular.module('App', ['ionic', 'ngStorage', 'ngCordovaOauth', 'ngCordova','ion-datetime-picker'])
  // For Facebook:
  // Make sure you have enabled Facebook as a Sign-In Method at your app's Firebase Console, insert your App ID and App Secret found from your Facebook app at https://developers.facebook.com.
  // Add http://localhost/callback as Valid OAuth redirect URIs at your Facebook Login Settings of your Facebook app.

// For Google:
// Make sure you have enabled Google as a Sign-In Method at your app's Firebase Console.
// GoogleWebClientId can be found from your Firebase Console, under GoogleSignIn.
// Add http://localhost/callback at your API Credentials for the app at https://console.developers.google.com/apis. Note that this is different from the Firebase OAuth Redirect Console.

// For Twitter:
// Make sure you have enabled Twitter as a Sign-In Method at your app's Firebase Console, insert your App ID and App Secret found from your Twitter app at https://apps.twitter.com.
// Make sure you have added http://127.0.0.1:8080/callback as a Callback URL on your app at https://apps.twitter.com
// Note that Twitter Login DOES NOT WORK when you have livereload (-ls) enabled on your ionic app.
.run(function($rootScope){
    $rootScope.dateValue = new Date();
    $rootScope.timeValue = new Date();
	$rootScope.timeValue1 = new Date();
	$rootScope.timeValue1.setHours ( $rootScope.timeValue1.getHours() + 4 );
    $rootScope.datetimeValue = new Date();
	
	$rootScope.mdatetimeValue1=new Date();
	//$rootScope.mtimeValue1=new Date();
	//$rootScope.mtimeValue=new Date();
	
	
	
})

.constant('Social', {
    facebookAppId: "311446895879250",
    googleWebClientId: "186627108976-pp14psof700irv52rim2atbp8mhq7spb.apps.googleusercontent.com",
    twitterKey: "rLaHz4Ypr91wapIgalbWN1yFv",
    twitterSecret: "8hPHBsPBxgFtCsvdBtjwEBvGUWRgDkliLWHMJ1zkN4zWtyWwM3"
  })
  //Constants for the Popup messages
  //For the icons, refer to http://ionicons.com for all icons.
  //Here you can edit the success and error messages on the popups.
  .constant('Popup', {
    delay: 3000, //How long the popup message should show before disappearing (in milliseconds -> 3000 = 3 seconds).
    successIcon: "ion-happy-outline",
    errorIcon: "ion-sad-outline",
    accountCreateSuccess: "Congratulations! Your account has been created. Logging you in.",
    emailAlreadyExists: "Sorry, but an account with that email address already exists. Please register with a different email and try again.",
    usernameAlreadyExists: "Sorry, but an account with that username already exists. Please register with a different username and try again.",
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
    uploadImageError: "Sorry, but we\'ve encountered an error uploading your image. Please try again later.",
	 uploadImageError: "Sorry, we\'ve encountered an error uploading your image to Firebase. Try again later.",
	cordovaError: "This feature work in device only",
	 productAddSuccess: "Congratulations! Your product has been successfully added.",
    productEditSuccess: "Congratulations! Your product has been successfully updated."
  })
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'views/login/login.html',
        controller: 'loginController'
      })
      .state('forgotPassword', {
        url: '/forgotPassword',
        templateUrl: 'views/forgotPassword/forgotPassword.html',
        controller: 'forgotPasswordController'
      })
      .state('register', {
        url: '/register',
        templateUrl: 'views/register/register.html',
        controller: 'registerController'
      })
      .state('completeAccount', {
        url: '/completeAccount',
        templateUrl: 'views/completeAccount/completeAccount.html',
        controller: 'completeAccountController'
      })
      .state('messages', {
        url: '/messages',
        templateUrl: 'views/messages/messages.html',
        controller: 'messagesController'
      })
      .state('message', {
        url: '/message',
        templateUrl: 'views/message/message.html',
        controller: 'messageController'
      })
      .state('groups', {
        url: '/groups',
        templateUrl: 'views/groups/groups.html',
        controller: 'groupsController'
      })
      .state('group', {
        url: '/group',
        templateUrl: 'views/group/group.html',
        controller: 'groupController'
      })
      .state('groupDetails', {
        url: '/groupDetails',
        templateUrl: 'views/groupDetails/groupDetails.html',
        controller: 'groupDetailsController'
      })
      .state('friends', {
        url: '/friends',
        templateUrl: 'views/friends/friends.html',
        controller: 'friendsController'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'views/profile/profile.html',
        controller: 'profileController'
      })
	  .state('home', {
        url: '/home',
        templateUrl: 'views/home/home.html',
        controller: 'homeController'
      })
	  .state('attendance', {
        url: '/attendance',
        templateUrl: 'views/attendance/attendance.html',
        controller: 'attendanceController'
      })
	  .state('task', {
        url: '/task',
        templateUrl: 'views/task/task.html',
        controller: 'taskController'
      })
	  .state('attendanceLogs', {
        url: '/attendanceLogs',
        templateUrl: 'views/attendanceLogs/attendanceLogs.html',
        controller: 'attendanceLogsController'
      })
	  .state('attendanceMonthly', {
        url: '/attendanceMonthly',
        templateUrl: 'views/attendanceMonthly/attendanceMonthly.html',
        controller: 'attendanceMonthlyController'
      })
	  .state('supervisor', {
        url: '/supervisor',
        templateUrl: 'views/supervisor/supervisor.html',
        controller: 'supervisorController'
      })
	  .state('leaveApplication', {
        url: '/leaveApplication',
        templateUrl: 'views/leaveApplication/leaveApplication.html',
        controller: 'leaveApplicationController'
      })
	  .state('manualLogs', {
        url: '/manualLogs',
        templateUrl: 'views/manualLogs/manualLogs.html',
        controller: 'manualLogsController'
      })
	  .state('appliedLeave', {
        url: '/appliedLeave',
        templateUrl: 'views/appliedLeave/appliedLeave.html',
        controller: 'appliedLeaveController'
      })
	  .state('logsReport', {
        url: '/logsReport',
        templateUrl: 'views/logsReport/logsReport.html',
        controller: 'logsReportController'
      })
	  .state('weeklyReport', {
        url: '/weeklyReport',
        templateUrl: 'views/weeklyReport/weeklyReport.html',
        controller: 'weeklyReportController'
      })
	  .state('todayReport', {
        url: '/todayReport',
        templateUrl: 'views/todayReport/todayReport.html',
        controller: 'todayReportController'
      })
	  .state('addPage', {
        url: '/addPage',
        templateUrl: 'views/addPage/addPage.html',
        controller: 'addController'
      })
    $urlRouterProvider.otherwise("/login");
  })
  .directive('imageonload', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.bind('load', function() {
          //call the function that was passed
          scope.$apply(attrs.imageonload);
        });
      }
    };
  })
  .filter('messageFilter', function() {
    return function(dataArray, searchTerm) {
      // If no array is given, exit.
      if (!dataArray) {
        return;
      }
      // If no search term exists, return the array unfiltered.
      else if (!searchTerm) {
        return dataArray;
      }
      // Otherwise, continue.
      else {
        // Convert filter text to lower case.
        var term = searchTerm.toLowerCase();
        return dataArray.filter(function(item) {
          // Check if filter contains the friend's username or name.
          var termInName = item.friend.name.toLowerCase().indexOf(term) > -1;
          return termInName;
        });
      }
    }
  })
  .filter('friendFilter', function(Service) {
    return function(dataArray, searchTerm) {
      // If no array is given, exit.
      if (!dataArray) {
        return;
      }
      // If no search term exists, return the array unfiltered.
      else if (!searchTerm) {
        return dataArray.filter(function(item) {
          // Check if friend is already assigned to a group.
          var notAssigned = Service.getAssignedIds().indexOf(item.id) == -1;
          return notAssigned;
        });
      }
      // Otherwise, continue.
      else {
        // Convert filter text to lower case.
        var term = searchTerm.toLowerCase();
        return dataArray.filter(function(item) {
          // Check if friend is already assigned to a group.
          var notAssigned = Service.getAssignedIds().indexOf(item.id) == -1;
          // Check if filter contains the friend's username or name.
          var termInName = item.name.toLowerCase().indexOf(term) > -1;
          var termInUsername = item.username.toLowerCase().indexOf(term) > -1;
          return notAssigned && (termInName || termInUsername);
        });
      }
    }
  })
  .filter('groupFilter', function() {
    return function(dataArray, searchTerm) {
      // If no array is given, exit.
      if (!dataArray) {
        return;
      }
      // If no search term exists, return the array unfiltered.
      else if (!searchTerm) {
        return dataArray;
      }
      // Otherwise, continue.
      else {
        // Convert filter text to lower case.
        var term = searchTerm.toLowerCase();
        var result = dataArray.filter(function(item) {
          var termInName = item.name.toLowerCase().indexOf(term) > -1;
          return termInName;
        });
        return result;
      }
    }
  })
  .filter('userFilter', function(Service) {
    return function(dataArray, searchTerm) {
      // If no array is given, exit.
      if (!dataArray) {
        return;
      }
      // If no search term exists, exit.
      else if (!searchTerm) {
        return dataArray.filter(function(item) {
          var notExcluded = Service.getExcludedIds().indexOf(item.id) == -1;
          return notExcluded;
        });
      }
      // Otherwise, continue.
      else {
        // Convert filter text to lower case.
        var term = searchTerm.toLowerCase();
        return dataArray.filter(function(item) {
          // Check if item's id is included in the excluded.
          var notExcluded = Service.getExcludedIds().indexOf(item.id) == -1;
          // Check if filter contains the friend's username or name.
          var termInName = item.name.toLowerCase().indexOf(term) > -1;
          var termInUsername = item.username.toLowerCase().indexOf(term) > -1;
          return notExcluded && (termInName || termInUsername);
        });
      }
    }
  })
  
  //Disables the back button of Android from activating on the Home screen to return back to Login view. Pressing back on Home Screen now closes the app.
  .run(['$rootScope', '$ionicPlatform', '$state', '$ionicHistory',
    function($rootScope, $ionicPlatform, $state, $ionicHistory) {
      $ionicPlatform.registerBackButtonAction(function(e) {
        if ($state.current.name == 'messages') {
          ionic.Platform.exitApp();
        } else if ($state.current.name == 'login') {
          ionic.Platform.exitApp();
        } else if ($ionicHistory.backView()) {
          $ionicHistory.goBack();
        }
        e.preventDefault();
        return false;
      }, 101);
    }
  ])
  
  
  
  .config(function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
  })
  
  .run(function($ionicPlatform) {
  
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    if (ionic.Platform.isWebView()) {
    }

  });
});
  
