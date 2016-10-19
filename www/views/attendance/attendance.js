// groups.js
// This is the controller that handles the groups of the user.
// Selecting a group will open the group chat.
'Use Strict';
angular.module('App').controller('attendanceController', function($scope, $http, $rootScope, $state, $localStorage, Utils, Popup, $timeout, Service, Watchers, $ionicTabsDelegate, $ionicHistory) {
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
	
  });

  
  $scope.currentTime=new Date();
  
  
  /*$scope.inDate = new Date();
  $scope.outDate = new Date();
  $scope.inTime = new Date();
  $scope.outTime = new Date();
  $scope.outDate.setDate($scope.outDate.getDate() + 1);
  */
   $scope.datetimeValue1=new Date();
   $scope.datetimeValue2=new Date();
   $scope.datetimeValue2.setDate($scope.datetimeValue2.getDate() + 1);
   
    
    $scope.openDatePickerone = function (val) {
      var ipObj1 = {
        callback: function (val) {  //Mandatory
          console.log('Return value from the datepicker popup is : ' + val, new Date(val));
          $scope.selectedDate1 = new Date(val);
        },
        disabledDates: [
          new Date(2016, 2, 16),
          new Date(2015, 3, 16),
          new Date(2015, 4, 16),
          new Date(2015, 5, 16),
          new Date('Wednesday, August 12, 2015'),
          new Date("08-16-2016"),
          new Date(1439676000000)
        ],
        from: new Date(2012, 1, 1),
        inputDate: new Date(),
        mondayFirst: true,
        disableWeekdays: [0],
        closeOnSelect: true,
        templateType: 'popup'
      };
      ionicDatePicker.openDatePicker(ipObj1);
};
 
  
  //$scope.currentTime=(new Date).toLocaleFormat("%A, %B %e, %Y");
  
  //Allow changing to other views when tabs is selected.
  $scope.changeTab = function(stateTo) {
	$ionicHistory.nextViewOptions({
      disableAnimate: true
    });
	
    $scope.canChangeView = true;
    $state.go(stateTo);
	
  };

  /*$scope.back = function() {
    $scope.canChangeView = true;
    $localStorage.friendId = undefined;
    $localStorage.conversationId = undefined;
    // $ionicHistory.goBack();
    $state.go('task');
  };*/
  
  
  $scope.$on('$ionicView.enter', function() {
	  
	
      //Initialize Service and Watchers
      $scope.conversations = [];
      $scope.conversations = Service.getConversationList();

      $scope.friends = [];
      $scope.friends = Service.getFriendList();

      console.log("Attaching Watchers");
      Watchers.addUsersWatcher();
      Watchers.addProfileWatcher($localStorage.accountId);
      Watchers.addNewFriendWatcher($localStorage.accountId);
      //Watchers.addNewConversationWatcher($localStorage.accountId);
      Watchers.addFriendRequestsWatcher($localStorage.accountId);
      Watchers.addRequestsSentWatcher($localStorage.accountId);
      Watchers.addNewGroupWatcher($localStorage.accountId);
    
    $scope.changedProfilePic = false;
    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
    //Select the 4th tab on the footer to highlight the profile icon.
    $ionicTabsDelegate.select(4);
  });

  
 
 
	/*$scope.goRequest = function() 
   {
		$http({
			url: 'https://fcm.googleapis.com/fcm/send',
			dataType: 'json',
			method: 'POST',
			data: parameter,
			).then(function mySucces(response) {
				  console.log(response.data);
				}, function myError(response) {
				  console.log(response.statusText);
				});
			
   }
   */
 
 
 
 
	$scope.submitAttendance = function(att) {
	var empID=att.args;
	Utils.show();
	$http({method  : 'POST', url : 'https://api.particle.io/v1/devices/1f0039001747353236343033/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd', data : empID, headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
	 }).success(function(data) {
		if(data.connected) {
		  Utils.hide();
		  Utils.message(Popup.successIcon, "Attedance done");
		} else {
		  Utils.hide();
		  Utils.message(Popup.successIcon, "Attedance failed");
		}
	  });
	  
	};
    

 
 
  
   $scope.save = function(user) 
   {
	   
		var taskId;
		var inDate=$scope.datetimeValue1.toLocaleDateString();
		var inTime=$scope.timeValue.toLocaleTimeString();
		var outDate=$scope.datetimeValue2.toLocaleDateString();
		var outTime=$scope.timeValue1.toLocaleTimeString();
		
		
		  firebase.database().ref().child('task').push({
			from:$localStorage.accountId,
			to:user.employee,
			Location:user.Location,
			taskType:user.taskType,
			status:user.taskStatus,
			dateCreated: Date(),
			startDate:inDate,
			startTime:inTime,
			endDate:outDate,
			endTime:outTime
			
		  }).then(function(response) {
			//Task added successfully.
			taskId = response.key;
			
			firebase.database().ref('accounts/' + $localStorage.accountId ).once('value', function(account) {
			  var taskArr = account.val().assignedTask;
			  if (!taskArr) {
				taskArr = [];
			  }
			  taskArr.push(taskId);
			  firebase.database().ref('accounts/' + $localStorage.accountId ).update({
				assignedTask: taskArr
			  });
			});
			
			//Show success message then redirect to home.
			Utils.message(Popup.successIcon, "Task is created")
			  .then(function() {
				$scope.canChangeView = true;
				$state.go('task');
			  })
			  .catch(function() {
				$scope.canChangeView = true;
				//User closed the prompt, redirect immediately.
				$state.go('task');
			  });
		  });
    
	};
  
  
});
