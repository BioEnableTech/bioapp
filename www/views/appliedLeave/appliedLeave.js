// groups.js
// This is the controller that handles the groups of the user.
// Selecting a group will open the group chat.
'Use Strict';
angular.module('App').controller('appliedLeaveController', function($scope, $ionicPopup, $ionicModal, $timeout, $filter, $rootScope, $http, $ionicSideMenuDelegate, $rootScope, $state, $localStorage, Utils, Popup, $timeout, Service, Watchers, $ionicTabsDelegate, $ionicHistory) {


  $rootScope.changeMemu = function(stateTo) {
    //alert(stateTo);
	$scope.changeTab(stateTo)
 };
  

// Triggered on a button click, or some other target
$scope.showPopup = function(userData) {
  

  // An elaborate, custom popup
  var myPopup = $ionicPopup.show({
    fromTemplateUrl: 'views/leaveDetails/leaveDetails.html',
    title: ''+userData.userName,
    subTitle: 'From : '+userData.startDate+" To : "+userData.endDate+"<br><br>Subject : "+userData.subject,
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Approve</b>',
        type: 'button-positive',
        onTap: function(e) {
			
			Service.upDateLeaveApplication(userData.userKey,userData.startDate,userData.endDate);
			
			
        }
      }
    ]
  });

  myPopup.then(function(res) {
    console.log('Tapped!', res);
  });

  
  /*
  $timeout(function() {
     myPopup.close(); //close the popup after 3 seconds for some reason
  }, 3000);
  */
  
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

  //Service.getLeaveApplicationData();
  var application=[];

  firebase.database().ref('accounts/' + $localStorage.accountId+"/userList/").on("value", function(snapshot){
			
			empIdVal=snapshot.val();
			var userName="";			
				
				
			for(j=0;j<empIdVal.length;j++)
			{
				var userEmp;
				empIDTest=empIdVal[j].empId;
				
				firebase.database().ref('accounts/' + empIdVal[j].userKey).on("value", function(snapshot){
					userName=snapshot.val().name;
				console.log("1"+userName);
				})
				
				firebase.database().ref('leave/' + empIdVal[j].userKey+"/applied").once('value', function(accountName) {
					applied=accountName.val().applied;
					
					accountName.forEach(function(childSnapshot) {
					var childData = childSnapshot.val();
						if(childData.status=='false')
						{
							var id=empIdVal[j].userKey;
								application.push({
								dateCreated:childData.dateCreated,
								description:childData.description,
								endDate:childData.endDate,
								startDate:childData.startDate,
								status:childData.status,
								subject:childData.subject,
								userKey:id,
								userName:userName
								});
						}
					});
				});
				break;
			}
			
			$scope.leaves=application;
			
  });
  
  
  
  /*
  var application= Service.getLeaveApplicationData();
  console.log("1"+application);
  $scope.leaves=application;
*/
   
  
  $scope.$on('$ionicView.enter', function() {
	  
	  
	  
    $scope.changedProfilePic = false;
    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
    //Select the 4th tab on the footer to highlight the profile icon.
    //$ionicTabsDelegate.select(4);
  });

	
});
	
	
	
	
	



