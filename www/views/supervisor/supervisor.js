// groups.js
// This is the controller that handles the groups of the user.
// Selecting a group will open the group chat.
'Use Strict';
angular.module('App').controller('supervisorController', function($scope, Service,Watchers, $ionicModal, $timeout, $filter, $rootScope, $http, $ionicSideMenuDelegate, $rootScope, $state, $localStorage, Utils, Popup, $timeout, Service, Watchers, $ionicTabsDelegate, $ionicHistory) {

  
  $rootScope.changeMemu = function(stateTo) {
    //alert(stateTo);
	$scope.changeTab(stateTo)
 };
  
	
  
  
  $scope.groups = [];
  for (var i=0; i<=5; i++) {
    $scope.groups[i] = {
      name: i,
      items: []
    };
    for (var j=0; j<=3; j++) 
	{
      $scope.groups[i].items.push(i + '-' + j);
    }
  }
  
  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
  
  
  $scope.exit=function()
  {
	  ionic.Platform.exitApp();
  }
  
  //Allow changing to other views when tabs is selected.
  $rootScope.changeTab = function(stateTo) {
	$ionicHistory.nextViewOptions({
      disableAnimate: true
    });
	
    $scope.canChangeView = true;
    $state.go(stateTo);
	
  };

  $scope.ManualLogsData=Service.getManualLogsData();
  
 
  
  $scope.$on('$ionicView.enter', function() {
	  
    $scope.changedProfilePic = false;
    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
    //Select the 4th tab on the footer to highlight the profile icon.
    //$ionicTabsDelegate.select(4);
  });

	
});
	
	
	
	
	



