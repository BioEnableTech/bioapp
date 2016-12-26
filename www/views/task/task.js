// friends.js
// This is the controller that handles the friends list of the user.
// In order to be able to chat someone, one must be friends with them first.
// This view allows user to send and accept friend requests.
// Selecting a friend from the friendlist automatically opens a chat with them, if no conversation are made prior it will start a new chat.
'Use Strict';
angular.module('App').controller('taskController', function($scope, $timeout, Util,$state, $rootScope, $localStorage, Popup, $filter, $ionicPopover, $ionicModal, $timeout, Utils, Watchers, Service, $ionicTabsDelegate, $ionicHistory) {
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  
  $scope.shouldShowDelete = true;
  $scope.shouldShowReorder = true;
  $scope.listCanSwipe = true;
  
  $scope.currrnetTime=Date();
  
  
  var future;
  var diff;
  
  /*$scope.$on('$stateChangeStart', function(event) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
  });
  */
  
 $rootScope.changeMemu = function(stateTo) {
    //alert(stateTo);
	$scope.changeTab(stateTo)
 };
  
  
  
  $scope.exit=function()
  {
	  ionic.Platform.exitApp();
  }
  
  $scope.showAlert = function() {
   var alertPopup = $ionicPopup.alert({
     title: 'Don\'t eat that!',
     template: 'It might taste good'
   });

   alertPopup.then(function(res) {
     console.log('Thank you for not eating my delicious ice cream cone');
   });
 };

  $scope.shouldShowDelete = false;
 $scope.shouldShowReorder = false;
 $scope.listCanSwipe = true
  
  //Allow changing to other views when tabs is selected.
  $rootScope.changeTab = function(stateTo) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $scope.canChangeView = true;
    $state.go(stateTo);
  };
  
  
	$ionicModal.fromTemplateUrl('views/taskDetails/taskDetails.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    
	
	
	$scope.openModal = function(key) {
      Utils.show();
	  firebase.database().ref('task/' + key).on("value", function(task) {
		var supervisorName;
			firebase.database().ref('accounts/' + task.val().from).once('value', function(accountName) {
			supervisorName=accountName.val().username;
		  
				$scope.Location=task.val().Location;
				$scope.from=supervisorName;
				
				$scope.description=task.val().description;
				$scope.subject=task.val().subject;
				$scope.startTime=task.val().startTime;
				$scope.endTime=task.val().endTime;
				$scope.dateCreated=$filter('date')(new Date(task.val().dateCreated), 'MMM dd yyyy');
				$scope.startDate=task.val().startDate;
				$scope.endDate=task.val().endDate;
				$scope.status = task.val().status;
				$scope.taskType = task.val().taskType;
				$scope.to = task.val().to;
				$scope.totalTime=task.val().totalTime;
				
				Utils.hide();
				$scope.modal.show();
			});
		}, function (errorObject) {
		  console.log("The read failed: " + errorObject.code);
		});
		
	};
	
	
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
	
	
	

  $scope.$on('$ionicView.enter', function() {
    //Set mode to friends tab.
    $scope.mode = 'Assigned';

	$scope.taskAssigned = [];
    $scope.taskAssigned = Service.getTaskAssignedList();
	
	$scope.mytask = [];
	$scope.mytask = Service.getMyTaskAssignedList();
	
	
	
	//Notify whenever there are new messages.
    $scope.$watch(function() {
      return Service.getUnreadMessages();
    }, function(unreadMessages) {
      $scope.unreadMessages = unreadMessages;
    });

    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;

    //Select the 3rd tab on the footer to highlight the friends icon.
    $ionicTabsDelegate.select(5);
	
  });
 
 function padValue(value) {
    return (value < 10) ? "0" + value : value;
}
 
 function formatTime(dateVal) 
 {
    var newDate = new Date(dateVal);

    var sMonth = padValue(newDate.getMonth() + 1);
    var sDay = padValue(newDate.getDate());
    var sYear = newDate.getFullYear();
    var sHour = newDate.getHours();
    var sMinute = padValue(newDate.getMinutes());
	var sSeconds = padValue(newDate.getSeconds());
    var sAMPM = "AM";

    var iHourCheck = parseInt(sHour);
	
    if (iHourCheck >= 12) {
        sAMPM = "PM";
        sHour = iHourCheck - 12;
    }
    else if (iHourCheck === 0) {
        sHour = "12";
    }
    sHour = padValue(sHour);
    //return sMonth + "-" + sDay + "-" + sYear + " " + sHour + ":" + sMinute + " " + sAMPM;
	return  sHour + ":" + sMinute + ":"+ sSeconds + " " + sAMPM;
}

function formatDate(dateVal) 
 {
    var newDate = new Date(dateVal);

    var sMonth = padValue(newDate.getMonth() + 1);
    var sDay = padValue(newDate.getDate());
    var sYear = newDate.getFullYear();
    var sHour = newDate.getHours();
    var sMinute = padValue(newDate.getMinutes());
	var sSeconds = padValue(newDate.getSeconds());
    var sAMPM = "AM";

    var iHourCheck = parseInt(sHour);
    if (iHourCheck > 12) {
        sAMPM = "PM";
        sHour = iHourCheck - 12;
    }
    else if (iHourCheck === 0) {
        sHour = "12";
    }
    sHour = padValue(sHour);
    return  sMonth + "/" + sDay + "/" + sYear ;
	
}

	$scope.startTask=function(key)
	{
		var curntTime=formatTime(Date());
		var curntDate=formatDate(Date());
		future = new Date();
		$timeout($scope.timeUpdate, 1000);
		firebase.database().ref('task/' + key).update({
			status: "working",
			startTime : curntTime,
			startDate : curntDate
		});
		$scope.taskAssigned = [];
		$scope.taskAssigned = Service.getTaskAssignedList();
		$scope.mytask = [];
		$scope.mytask = Service.getMyTaskAssignedList();
	}
	
	$scope.endTask=function(key)
	{
		var curntTime=formatTime(Date());
		var curntDate=formatDate(Date());
		var totalTimeTaken=$scope.mytime;
		firebase.database().ref('task/' + key).update({
			status: "false",
			endTime : curntTime,
			endDate : curntDate,
			totalTime : totalTimeTaken,
		});
		$scope.taskAssigned = [];
		$scope.taskAssigned = Service.getTaskAssignedList();
		$scope.mytask = [];
		$scope.mytask = Service.getMyTaskAssignedList();
	}
	
	
	$scope.timeUpdate=function()
	{
		diff = Math.floor((new Date().getTime() - future.getTime()) / 1000);
        var time1=Util.dhms(diff);
		$scope.mytime=time1;
		$timeout($scope.timeUpdate, 1000);
	}
	
	
	$scope.$watch('searchText',function(value){
    console.log(value);
  })
	
	
})


  
  
  
  

.directive('countdown', [
    'Util', '$interval', function(Util, $interval) {
      return {
        restrict: 'A',
        scope: {
          date: '@'
        },
        link: function(scope, element) {
          var future;
          future = new Date(scope.date);
          $interval(function() {
            var diff;
            diff = Math.floor((new Date().getTime() - future.getTime()) / 1000);
            //console.log(future.getTime());
			//console.log(new Date().getTime());
			return element.text(Util.dhms(diff));
          }, 1000);
        }
      };
    }
	
  ])
  
.factory('Util', [
    function() {
      return {
        dhms: function(t) {
          var days, hours, minutes, seconds;
          days = Math.floor(t / 86400);
          t -= days * 86400;
          hours = Math.floor(t / 3600) % 24;
          t -= hours * 3600;
          minutes = Math.floor(t / 60) % 60;
          t -= minutes * 60;
          seconds = t % 60;
		  if(days!=0)
		  {
			return [days , hours + ':', minutes + ':', seconds + ''].join(' ');  
		  }
          else
		  {
			if(hours!=0)
			return [ hours + ' :', minutes + ' :', seconds + ''].join(' ');	  
			else
			return [ minutes + ' :', seconds + ''].join(' ');	  
		  }
	    }
      };
    }
]);

