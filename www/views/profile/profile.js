// home.js
// This is the controller that handles the main view when the user is successfully logged in.
// The account currently logged in can be accessed through localStorage.account.
// The authenticated user can be accessed through firebase.auth().currentUser.
'Use Strict';
angular.module('App').controller('profileController', function($scope, $rootScope, $state, $localStorage, $ionicSideMenuDelegate, $http, Utils, Popup, $timeout, Service, $ionicTabsDelegate, $ionicHistory, Watchers) {
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  /*$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
  });
  */
  $scope.audioPlay=function()
  {
		
		var my_media = new Media('/android_asset/www/audio/voice_note_error.wav');
		my_media.play();
  }
  
  $scope.exit=function()
  {
	  ionic.Platform.exitApp();
  }

  
  
 $rootScope.changeMemu = function(stateTo) {
    //alert(stateTo);
	$scope.changeTab(stateTo)
 };
  
  
  //Allow changing to other views when tabs is selected.
  $rootScope.changeTab = function(stateTo) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $scope.canChangeView = true;
    $state.go(stateTo);
  };

  $scope.$on('$ionicView.enter', function() {
    //Notify whenever there are new messages.
    $scope.$watch(function() {
      return Service.getUnreadMessages();
    }, function(unreadMessages) {
      $scope.unreadMessages = unreadMessages;
    });

    //Update profile whenever there are changes done on the profile.
    $scope.$watch(function() {
      return Service.getProfile();
    }, function(profile) {
      if($scope.changedProfilePic)
        Utils.show();
      $scope.profile = Service.getProfile();
	  var test=Service.getSupervisorTree();
	  $scope.profile.supervisor=test;
	  
    });

    //Notify whenever there are new friend requests.
    $scope.$watch(function() {
      return Service.getFriendRequestsCount();
    }, function(friendRequests) {
      $scope.friendRequestsCount = friendRequests;
    });

    //Notify whenever there are new group messages.
    $scope.$watch(function() {
      return Service.getUnreadGroupMessages();
    }, function(unreadGroupMessages) {
      $scope.unreadGroupMessages = unreadGroupMessages;
    });

    $scope.changedProfilePic = false;
    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
    //Select the 4th tab on the footer to highlight the profile icon.
    $ionicTabsDelegate.select(3);
  });

  //Set profile image while deleting the previous uploaded profilePic.
  $scope.$on('imageUploaded', function(event, args) {
    $scope.changedProfilePic = true;
    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      if(account.val().profilePic != 'img/profile.png')
        firebase.storage().refFromURL(account.val().profilePic).delete();
    });
    firebase.database().ref('accounts/' + $localStorage.accountId).update({
      profilePic: args.imageUrl
    });
  });

  //Logout the user. Clears the localStorage as well as reinitializing the variable of watcherAttached to only trigger attaching of watcher once.
  $scope.logout = function() {
    if (firebase.auth()) {
      firebase.database().ref('accounts/' + $localStorage.accountId).update({
        online: false
      });
      firebase.auth().signOut().then(function() {
        Watchers.removeWatchers();
        //Clear the saved credentials.
        $localStorage.$reset();
        //Proceed to login screen.
        $scope.canChangeView = true;
        $state.go('login');
      }, function(error) {
        //Show error message.
        Utils.message(Popup.errorIcon, Popup.errorLogout);
      });
    } else {
      //Clear the saved credentials.
      $localStorage.$reset();
      //Proceed to login screen.
      $scope.canChangeView = true;
      $state.go('login');
    }
  };

  //Function to assign a profile picture, calls imageUploaded function on top when Firebase is done uploading the image.
  $scope.changeProfilePic = function() {
    var popup = Utils.confirm('ion-link', 'Profile Picture: Do you want to take a photo or choose from your gallery?', 'ion-images', 'ion-camera');
    popup.then(function(isCamera) {
      var imageSource;
      if (isCamera) {
        imageSource = Camera.PictureSourceType.CAMERA;
      } else {
        imageSource = Camera.PictureSourceType.PHOTOLIBRARY;
      }
      //Show loading.
      Utils.getProfilePicture(imageSource);
    });
  };

  //Constrains our selected picture to be of same width and height, to preserve proportion.
  $scope.constrainProportion = function() {
    if($scope.changedProfilePic) {
      Utils.hide();
      $scope.changedProfilePic = false;
    }
    var img = document.getElementById('profilePic');
    var width = img.width;
    img.style.height = width + "px";
  };
  
  
  $scope.empIdUpdate = function(profile) {
	firebase.database().ref('accounts/' + $localStorage.accountId).update({
      empId: profile.empId
    });
  };
  
  $scope.buttonShow = function(profile) {
	var len=profile.empId;
	if(len.length==3)
	{  $scope.myVar=true; }
	};
  
  
  $scope.submitAttendance = function() 
  {
	var address;
	var lati;
	var longi;
	var empId;
	
	Utils.show();
	
		var isWebView = ionic.Platform.isWebView();
		if(isWebView)
		{
			var networkState = navigator.connection.type;

			if (networkState == Connection.NONE) 
			{
				Utils.hide();
				Utils.message(Popup.errorIcon, "Network not available");
				
				
			}else
			{
				cordova.plugins.diagnostic.isGpsLocationAvailable(function(available)
				{
					//alert("GPS location is " + (available ? "available" : "not available"));
						if(available)
						{
							navigator.geolocation.getCurrentPosition(
								function onSuccess(position) {
								lati=position.coords.latitude;	
								longi=position.coords.longitude;
								$http.post('https://maps.googleapis.com/maps/api/geocode/json?latlng='+position.coords.latitude+','+position.coords.longitude+'&key=AIzaSyB9NvT1A2Ew7iFSLioZfmX4kpimsvAS7yw').then(function (response) {
									  for (var x in response.data.results)
									  {
										 address = response.data.results[x].formatted_address;
										  break;
									  }
								});	
							});
							firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
								empId=snapshot.val();
							});
							var empID={args:empId};
							var jsonstring = JSON.stringify(empID);
							$http.post('https://api.particle.io/v1/devices/1f0039001747353236343033/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd',jsonstring ).then(function (response) {
								firebase.database().ref('logs/' + empId).once('value').then(function(snapshot) {
								  var username = snapshot.val();
									var outTime=Date();
									var jsonVal=[{"time": outTime,"location": address,"latitude":lati,"longitude":longi}];
									if(username!=null)
									{	
										firebase.database().ref('logs/' + empId +'/').once('value', function(account1) {
										  var taskArr = account1.val().logTime;
										  jsonVal={"time": outTime,"location": address,"latitude":lati,"longitude":longi};
										  if (!taskArr) {	taskArr = [];	}
										  taskArr.push(jsonVal);
										  firebase.database().ref('logs/'+ empId).update({
											logTime: taskArr
										  });
										});
									}
									else{	firebase.database().ref('logs/' + empId +"/").update({ logTime: jsonVal });
									}
								});
								Utils.hide();
								Utils.message(Popup.successIcon, "Attedance done");
							 });
						}else{
							Utils.message(Popup.successIcon, "Please enable GPS Location");
						}
						
					
					}, function(error){
						alert("The following error occurred: "+error);
						
					});
				
			}
			
		}
		else
		{
			navigator.geolocation.getCurrentPosition(
				function onSuccess(position) {
				lati=position.coords.latitude;	
				longi=position.coords.longitude;
				$http.post('https://maps.googleapis.com/maps/api/geocode/json?latlng='+position.coords.latitude+','+position.coords.longitude+'&key=AIzaSyB9NvT1A2Ew7iFSLioZfmX4kpimsvAS7yw').then(function (response) {
					  for (var x in response.data.results)
					  {
						 address = response.data.results[x].formatted_address;
						  break;
					  }
				});	
			});
			firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
				empId=snapshot.val();
			});
			var empID={args:empId};
			var jsonstring = JSON.stringify(empID);
			$http.post('https://api.particle.io/v1/devices/1f0039001747353236343033/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd',jsonstring ).then(function (response) {
				firebase.database().ref('logs/' + empId).once('value').then(function(snapshot) {
				  var username = snapshot.val();
					var outTime=Date();
					var jsonVal=[{"time": outTime,"location": address,"latitude":lati,"longitude":longi}];
					if(username!=null)
					{	
						firebase.database().ref('logs/' + empId +'/').once('value', function(account1) {
						  var taskArr = account1.val().logTime;
						  jsonVal={"time": outTime,"location": address,"latitude":lati,"longitude":longi};
						  if (!taskArr) {	taskArr = [];	}
						  taskArr.push(jsonVal);
						  firebase.database().ref('logs/'+ empId).update({
							logTime: taskArr
						  });
						});
					}
					else{	firebase.database().ref('logs/' + empId +"/").update({ logTime: jsonVal });
					}
				});
				Utils.hide();
				Utils.message(Popup.successIcon, "Attedance done");
			});
		}
		
		
		
		
		
			
			 
			 
			 
			 
	
	/*
	$http({method  : 'POST', url : 'http://gpsintegrated.com/bioapp/postTest.php?args=Super%20Hero', jsonstring , headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
	//$http({method  : 'POST', url : 'https://api.particle.io/v1/devices/1f0039001747353236343033/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd', data : empID, headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
	 */
	 
	 /*
	 }).success(function(data) {
		console.log(data);
		if(data.connected) {
		  Utils.hide();
		  Utils.message(Popup.successIcon, "Attedance done");
		} else {
		  Utils.hide();
		  Utils.message(Popup.successIcon, "Attedance failed");
		}
	  });
	
	
	/*
	
	var empId;
	/*firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
		empId=snapshot.val();
	});

	Utils.show();
	
	// device code 
	$http({method  : 'POST', url : 'https://api.particle.io/v1/devices/1f0039001747353236343033/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd', data : '3506', headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
	 }).success(function(data) {
		if(data.connected) {
		  Utils.hide();
		  Utils.message(Popup.successIcon, "Attedance done");
		} else {
		  Utils.hide();
		  Utils.message(Popup.successIcon, "Attedance failed");
		}
	  });
		
		/*
		
	   firebase.database().ref('logs/' + empId +'/').once('value', function(account1) {
		  var taskArr = account1.val().logTime;
		  var outTime=Date();
		  if (!taskArr) {
			taskArr = [];
		  }
		  taskArr.push(outTime);
		  firebase.database().ref('logs/'+ empId).update({
			logTime: taskArr
		  });
		});
		*/

	
	}
	
	
	
	$scope.submitAttendance1 = function() 
	{
		var address;
		var lati;
		var longi;
		var empId;
		Utils.show();
		firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
			empId=snapshot.val();
		});
		var empID={args:empId};
		var jsonstring = JSON.stringify(empID);
		$http.post('https://api.particle.io/v1/devices/3c0017000a51353335323536/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd',jsonstring ).then(function (response) {
			Utils.hide();
			Utils.message(Popup.successIcon, "Attedance done");
		 });
	}
	
	$scope.submitAttendance2 = function() 
	{
		var address;
		var lati;
		var longi;
		var empId;
		Utils.show();
		firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
			empId=snapshot.val();
		});
		var empID={args:empId};
		var jsonstring = JSON.stringify(empID);
		$http.post('https://api.particle.io/v1/devices/3a0043001347353236343033/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd',jsonstring ).then(function (response) {
			Utils.hide();
			Utils.message(Popup.successIcon, "Attedance done");
		 });
	}
	
	$scope.submitAttendance3 = function() 
	{
		var address;
		var lati;
		var longi;
		var empId;
		Utils.show();
		firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
			empId=snapshot.val();
		});
		var empID={args:empId};
		var jsonstring = JSON.stringify(empID);
		$http.post('https://api.particle.io/v1/devices/27004f000151353432393339/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd',jsonstring ).then(function (response) {
			Utils.hide();
			Utils.message(Popup.successIcon, "Attedance done");
		 });
	}
	
	
	$scope.submitAttendance4 = function() 
	{
		var address;
		var lati;
		var longi;
		var empId;
		Utils.show();
		firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
			empId=snapshot.val();
		});
		var empID={args:empId};
		var jsonstring = JSON.stringify(empID);
		$http.post('https://api.particle.io/v1/devices/36002c000a51353335323536/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd',jsonstring ).then(function (response) {
			Utils.hide();
			Utils.message(Popup.successIcon, "Attedance done");
		 });
	}
	
	
  
});

 
