// groups.js
// This is the controller that handles the groups of the user.
// Selecting a group will open the group chat.
'Use Strict';
angular.module('App').controller('leaveApplicationController', function($scope, $rootScope, $http, $ionicSideMenuDelegate, $rootScope, $state, $localStorage, Utils, Popup, $timeout, Service, Watchers, $ionicTabsDelegate, $ionicHistory) {
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  /*$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
	
  });*/

  
  $rootScope.changeMemu = function(stateTo) {
    //alert(stateTo);
	$scope.changeTab(stateTo)
 };
  
  
  
  
  $scope.currentTime=new Date();
  
  
  
  $scope.exit=function()
  {
	  ionic.Platform.exitApp();
  }
  
  
   $scope.datetimeValue1=new Date();
   $scope.datetimeValue2=new Date();
   $scope.datetimeValue2.setDate($scope.datetimeValue2.getDate() + 1);
   
    
  
  
  
  //Allow changing to other views when tabs is selected.
  $rootScope.changeTab = function(stateTo) {
	$ionicHistory.nextViewOptions({
      disableAnimate: true
    });
	
    $scope.canChangeView = true;
    $state.go(stateTo);
	
  };

  $scope.$on('$ionicView.enter', function() {
	  
	
      //Initialize Service and Watchers
      $scope.employees = [];
      //$scope.conversations = Service.getConversationList();
	  
	  $scope.employees=Service.getFriendList();
	  
	  console.log("Attaching Watchers");
      
    $scope.changedProfilePic = false;
    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
    //Select the 4th tab on the footer to highlight the profile icon.
    $ionicTabsDelegate.select(4);
  });

 
	
 
 
 
   
  
  
});
