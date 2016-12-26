// groups.js
// This is the controller that handles the groups of the user.
// Selecting a group will open the group chat.
'Use Strict';
angular.module('App').controller('logsReportController', function($scope, HoursCalc, Service, Watchers , $ionicModal, $timeout,$filter, $http, $rootScope, $http, $ionicSideMenuDelegate, $rootScope, $state, $localStorage, Utils, Popup, $timeout, Service, Watchers, $ionicTabsDelegate, $ionicHistory) {

  
  $rootScope.changeMemu = function(stateTo) {
    //alert(stateTo);
	$scope.changeTab(stateTo)
 };
  
	$ionicModal.fromTemplateUrl('views/manualLogForm/manualLogForm.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
  
	$scope.openModal = function() {
		$scope.modal.show();
    };
  
	$scope.closeModal = function() {
      $scope.modal.hide();
    };
  
  
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
	var day = date.getDay();  
	var firstDay = new Date(y, m, 1);
	var lastday = new Date(y, m + 1, 0);
	var cnt=0;
	var mdays=[];
	
	var mntName=['January','February','March','April','May','June','July','August','September','October','November','December'];
	var weekDays=[ 'Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday','Friday','Saturday'];
	 
	 
	$scope.year=y;
	$scope.month=mntName[m];
	
	var f= firstDay.getDay();
	var l= lastday.getDate();
	
  /*
	$timeout(callAtTimeout, 1000);

	function callAtTimeout() {
		var nowDate = new Date()
		$scope.cuurentTime=Service.getDate(nowDate);
		$scope.cuurentDate=weekDays[day]+", "+d+" "+mntName[m]+" "+y;
		$timeout(callAtTimeout, 1000);
		
		
		var logLength;
		logLength=Service.getLogsDataLength();
		logLength=parseInt(logLength);
		
		if(logLength%2==1)
		{
			document.getElementById('attendance').className = "button button-clear button-assertive";
			document.getElementById('btnIn').setAttribute("disabled", "disabled");
			document.getElementById('btnOut').removeAttribute("disabled");
			
		}else{
			document.getElementById('attendance').className = "button button-clear button-balanced";
			document.getElementById('btnOut').setAttribute("disabled", "disabled");
			document.getElementById('btnIn').removeAttribute("disabled");
			
		}
		
	}
	*/
  
  
	$scope.LogsData1=Service.getLogsData();
  
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

  $scope.$on('timeCard', function() {
    $timeout(function () {
      $scope.LogsData1=Service.getLogsData();
    });
  });
  
  //Watchers.addAttendanceLogsWatcher();
  
  
  
  $scope.$on('$ionicView.enter', function() {
	  
    $scope.changedProfilePic = false;
    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
    //Select the 4th tab on the footer to highlight the profile icon.
    //$ionicTabsDelegate.select(4);
  });

	
	
	
	
	$scope.submitAttendance = function(logType) 
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
									  
									  firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
											empId=snapshot.val();
										});
										var empID={args:empId};
										var jsonstring = JSON.stringify(empID);
										
										// Device attendance code commented till device is fixed
										
										//$http.post('https://api.particle.io/v1/devices/1f0039001747353236343033/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd',jsonstring ).then(function (response) {
											firebase.database().ref('logs/' + empId).once('value').then(function(snapshot) {
											  var username = snapshot.val();
												var outTime=Date();
												var jsonVal=[{"time": outTime,"location": address,"latitude":lati,"longitude":longi,'logStatus':'valid',"logType":logType}];
												if(username!=null)
												{	
													firebase.database().ref('logs/' + empId +'/').once('value', function(account1) {
													  var taskArr = account1.val().logTime;
													  jsonVal={"time": outTime,"location": address,"latitude":lati,"longitude":longi,'logStatus':'valid',"logType":logType};
													  if (!taskArr) {	taskArr = [];	}
													  taskArr.push(jsonVal);
													  firebase.database().ref('logs/'+ empId).update({
														logTime: taskArr
													  });
													  
														Utils.hide();
														Utils.message(Popup.successIcon, "Attedance done");
														
														
														Watchers.addAttendanceLogsWatcher();
														
													  
													});
												}
												else{	firebase.database().ref('logs/' + empId +"/").update({ logTime: jsonVal });
												}
											});
											
										 
										 //});
									  
								});	
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
						  address = response.data.results[x].formatted_address.toString();
						  break;
					  }
					  
					  firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
							empId=snapshot.val();
						});
						var empID={args:empId};
						var jsonstring = JSON.stringify(empID);
						
						// Device attendance code commented till device is fixed
						
						//$http.post('https://api.particle.io/v1/devices/1f0039001747353236343033/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd',jsonstring ).then(function (response) {
							firebase.database().ref('logs/' + empId).once('value').then(function(snapshot) {
							  var username = snapshot.val();
								var outTime=Date();
								//var jsonVal=[{"time": outTime,"location": address,"latitude":lati,"longitude":longi,'logStatus':'valid'}];
								if(username!=null)
								{	
									firebase.database().ref('logs/' + empId +'/').once('value', function(account1) {
									  var taskArr = account1.val().logTime;
									  jsonVal={"time": outTime,"location": address,"latitude":lati,"longitude":longi,'logStatus':'valid',"logType":logType};
									  if (!taskArr) {	taskArr = [];	}
									  taskArr.push(jsonVal);
									  firebase.database().ref('logs/'+ empId).update({
										logTime: taskArr
									  });
									  
											Utils.hide();
											Utils.message(Popup.successIcon, "Attedance done");
									  
									});
								}
								else{	firebase.database().ref('logs/' + empId +"/").update({ logTime: jsonVal });
								}
							});
							
						//});
					  
				});	
			});
			
		}
			
	}
	
	
	$scope.newLogs=function(user1)
	{
		
		var mInTime1=user1.mtimeValue1;
		var mOutTime1=user1.mtimeValue;
		//alert(mInTime1);
		
		$scope.addManualLogs(user1.mtimeValue1);
		$scope.addManualLogs(user1.mtimeValue);
		user1.mtimeValue1="";
		user1.mtimeValue="";
		
	}
	
	
	
	/*
	var timeStart = new Date("Fri Dec 16 2016 13:56:16 GMT+0530 (India Standard Time)").getTime();
	var timeEnd = new Date("Fri Dec 16 2016 14:52:16 GMT+0530 (IST)").getTime();
	var hourDiff = timeEnd - timeStart; //in ms
	var secDiff = hourDiff / 1000; //in s
	var minDiff = hourDiff / 60 / 1000; //in minutes
	var hDiff = hourDiff / 3600 / 1000; //in hours
	
	var hours = Math.floor(hDiff);
	var minutes = minDiff - 60 * hours;
	console.log(hours+":"+minutes); //{hours: 0, minutes: 30}
	
	alert(hours+":"+minutes);
	
	*/
	
	
	$scope.addManualLogs=function (mInTime12)
	{
		
		var logDate=mInTime12.toString();
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
									  
									  firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
											empId=snapshot.val();
										});
										var empID={args:empId};
										var jsonstring = JSON.stringify(empID);
										
										// Device attendance code commented till device is fixed
										
										//$http.post('https://api.particle.io/v1/devices/1f0039001747353236343033/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd',jsonstring ).then(function (response) {
											firebase.database().ref('logs/' + empId).once('value').then(function(snapshot) {
											  var username = snapshot.val();
												
												var jsonVal=[{"time": logDate,"location": address,"latitude":lati,"longitude":longi,'logStatus':'invalid'}];
												if(username!=null)
												{	
													firebase.database().ref('logs/' + empId +'/').once('value', function(account1) {
													  var taskArr = account1.val().logTime;
													  jsonVal={"time": logDate,"location": address,"latitude":lati,"longitude":longi,'logStatus':'invalid'};
													  if (!taskArr) {	taskArr = [];	}
													  taskArr.push(jsonVal);
													  firebase.database().ref('logs/'+ empId).update({
														logTime: taskArr
													  });
													  
														Utils.hide();
														Utils.message(Popup.successIcon, "Attedance done");
														$scope.closeModal();
														
														
													});
												}
												else{	firebase.database().ref('logs/' + empId +"/").update({ logTime: jsonVal });
												}
											});
											
										// });
										
									  
								});	
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
					  
					  firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
							empId=snapshot.val();
						});
						var empID={args:empId};
						var jsonstring = JSON.stringify(empID);
						
						// Device attendance code commented till device is fixed
						
						//$http.post('https://api.particle.io/v1/devices/1f0039001747353236343033/led?access_token=e335ee16ec1cccd95c4df87f1651451bda84d5fd',jsonstring ).then(function (response) {
							firebase.database().ref('logs/' + empId).once('value').then(function(snapshot) {
							  var username = snapshot.val();
								
								var jsonVal=[{"time": logDate,"location": address,"latitude":lati,"longitude":longi,'logStatus':'invalid'}];
								if(username!=null)
								{	
									firebase.database().ref('logs/' + empId +'/').once('value', function(account1) {
									  var taskArr = account1.val().logTime;
									  jsonVal={"time": logDate,"location": address,"latitude":lati,"longitude":longi,'logStatus':'invalid'};
									  if (!taskArr) {	taskArr = [];	}
									  taskArr.push(jsonVal);
									  firebase.database().ref('logs/'+ empId).update({
										logTime: taskArr
									  });
									  
											Utils.hide();
											Utils.message(Popup.successIcon, "Attedance done");
											$scope.closeModal();
									  
									});
								}
								else{	firebase.database().ref('logs/' + empId +"/").update({ logTime: jsonVal });
								}
							});
							
						//});
					  
					  
				});	
			});
			
		}
		
		
	}
	
})
.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
})

.factory('HoursCalc', [
    function() {
      return {
        getTotalTime: function(timeStart,timeEnd) {
			var timeStart = new Date(timeStart).getTime();
			var timeEnd = new Date(timeEnd).getTime();
			var hourDiff = timeEnd - timeStart; //in ms
			var secDiff = hourDiff / 1000; //in s
			var minDiff = hourDiff / 60 / 1000; //in minutes
			var hDiff = hourDiff / 3600 / 1000; //in hours
			var hours = Math.floor(hDiff);
			var minutes = minDiff - 60 * hours;
			minutes=minutes.toFixed(0)
			if(minutes.length==1)
			{
				minutes="0"+minutes;
			}
			return "Time : "+hours+":"+minutes+"";
		}
      };
    }
]);
