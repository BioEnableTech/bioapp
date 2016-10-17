// friends.js
// This is the controller that handles the friends list of the user.
// In order to be able to chat someone, one must be friends with them first.
// This view allows user to send and accept friend requests.
// Selecting a friend from the friendlist automatically opens a chat with them, if no conversation are made prior it will start a new chat.
'Use Strict';
angular.module('App').controller('taskController', function($scope, $state, $localStorage, Popup, $timeout, Utils, Watchers, Service, $ionicTabsDelegate, $ionicHistory) {
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  $scope.$on('$stateChangeStart', function(event) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
  });

  $scope.shouldShowDelete = false;
 $scope.shouldShowReorder = false;
 $scope.listCanSwipe = true
  
  //Allow changing to other views when tabs is selected.
  $scope.changeTab = function(stateTo) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $scope.canChangeView = true;
    $state.go(stateTo);
  };
  
	

  $scope.$on('$ionicView.enter', function() {
    //Set mode to friends tab.
    $scope.mode = 'Assigned';

	$scope.taskAssigned = [];
    $scope.taskAssigned = Service.getTaskAssignedList();
	
    //Notify whenever there are new messages.
    $scope.$watch(function() {
      return Service.getUnreadMessages();
    }, function(unreadMessages) {
      $scope.unreadMessages = unreadMessages;
    });

    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;

    //Select the 3rd tab on the footer to highlight the friends icon.
    $ionicTabsDelegate.select(7);
	
  });

	$scope.startTask=function(key)
	{
		firebase.database().ref('task/' + key).update({
			status: "working",
			startTime : Date()
		});
		$scope.taskAssigned = [];
		$scope.taskAssigned = Service.getTaskAssignedList();
	}
	
	$scope.endTask=function(key)
	{
		firebase.database().ref('task/' + key).update({
			status: "false",
			endTime : Date()
		});
		$scope.taskAssigned = [];
		$scope.taskAssigned = Service.getTaskAssignedList();
	}
	
});

