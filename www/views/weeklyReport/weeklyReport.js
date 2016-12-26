// groups.js
// This is the controller that handles the groups of the user.
// Selecting a group will open the group chat.
'Use Strict';
angular.module('App').controller('weeklyReportController', function($scope, HoursCalc, Service, Watchers , $ionicModal, $timeout,$filter, $http, $rootScope, $http, $ionicSideMenuDelegate, $rootScope, $state, $localStorage, Utils, Popup, $timeout, Service, Watchers, $ionicTabsDelegate, $ionicHistory) {

  
  $rootScope.changeMemu = function(stateTo) {
    //alert(stateTo);
	$scope.changeTab(stateTo)
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

  $scope.$on('$ionicView.enter', function() {
	  
    $scope.changedProfilePic = false;
    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
    //Select the 4th tab on the footer to highlight the profile icon.
    //$ionicTabsDelegate.select(4);
  });

  
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
	
	
  
	var week="";
	var myTable="<div class='row' style='color:black;font-size: 12px;font-weight: bold; !important;width: 102% !important'>";
	myTable=myTable+"<div class='col col-9'>Type</div><div class='col col-13'>Sun</div><div class='col col-13'>Mon</div><div class='col col-13'>Tue</div><div class='col col-13'>Wed</div><div class='col col-13'>Thu</div><div class='col col-13'>Fri</div><div class='col col-13'>Sat</div></div>";
	myTable=myTable+"<div class='row item' style='color:black;font-size: 10px;width: 102% !important'>";
	var cnt=1;
	var myArray=[];
	var currentDay = new Date();
    var n = 6-currentDay.getDay()
	for(var i=1;i<=d+n;i++)
	{ 
		if(cnt%7==1)
		{
			week=myTable+"</div><div class='row item' style='color:black;font-size: 10px;width: 102% !important'><div class='col col-9' style='font-weight: bold; !important'>IN</div>";
			myArray=[];
		}
		if(cnt<f)
		{
			for(var j=0;j<f;j++)
			{
				week=week+"<div class='col col-13'></div>";
				cnt++;
			}
		}
		if(cnt==8 || cnt==15 || cnt==22 || cnt==29 || cnt%14==0)
		{
			week=week+"<span style='font-size: 17px;margin-top:5px;'>|</span><div class='col col-13'><span id='dateIn"+i+"'>- -</span></div>";cnt++;
			myArray.push(i.toString());
		}else
		{
			week=week+"<span style='font-size: 17px;margin-top:5px;'>|</span><div class='col col-13'><span id='dateIn"+i+"'>- -</span></div>";cnt++;
			myArray.push(i.toString());
		}
	}
	myTable=week+"</div>";
	myTable=myTable+"<div class='row item' style='color:black;font-size: 10px;width: 102% !important'>";
	cnt=1;
	week="";
	for(var i=1;i<=d+n;i++)
	{ 
		if(cnt%7==1)
		{
			week=myTable+"</div><div class='row item' style='color:black;font-size: 10px;width: 102% !important'><div class='col col-9' style='font-weight: bold; !important'>OUT</div>";
		}
		if(cnt<f)
		{
			for(var j=0;j<f;j++)
			{
				week=week+"<div class='col col-13'></div>";
				cnt++;
			}
		}
		if(cnt==8 || cnt==15 || cnt==22 || cnt==29 || cnt%14==0)
		{
			week=week+"<span style='font-size: 17px;margin-top:5px;'>|</span><div class='col col-13'><span id='dateOut"+i+"'>- -</span></div>";cnt++;
		}else
		{
			week=week+"<span style='font-size: 17px;margin-top:5px;'>|</span><div class='col col-13'><span id='dateOut"+i+"'>- -</span></div>";cnt++;
		}
	}
	myTable=week+"</div>";
	
	// for Average
	cnt=1;
	week="";
	for(var i=1;i<=d+n;i++)
	{ 
		if(cnt%7==1)
		{
			week=myTable+"</div><div class='row item' style='color:black;font-size: 10px;width: 102% !important'><div class='col col-9' style='font-weight: bold; !important'>AVG</div>";
		}
		if(cnt<f)
		{
			for(var j=0;j<f;j++)
			{
				week=week+"<div class='col col-13'></div>";
				cnt++;
			}
		}
		if(cnt==8 || cnt==15 || cnt==22 || cnt==29 || cnt%14==0)
		{
			
			
			week=week+"<span style='font-size: 17px;margin-top:5px;'>|</span><div class='col col-13'><span id='avg"+i+"'>- -</span></div>";cnt++;
		}else
		{
			week=week+"<span style='font-size: 17px;margin-top:5px;'>|</span><div class='col col-13'><span id='avg"+i+"'>- -</span></div>";cnt++;
		}
	}
	myTable=week+"</div>";
	
	document.getElementById('weeklyCalendar').innerHTML=myTable;
	
	var empId;
	firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
		empId=snapshot.val();
	});
	var LogsData=[];
	var tempDateIn=0;
	var tempDateOut=0;
	var myItem=[];
	var inLog='';
	var outLog='';
	var cnt=0;
	firebase.database().ref('logs/' + empId).once('value', function(accountName) {
		logTime=accountName.val();
		for(var i=0;i<logTime.logTime.length;i++)
		{
			var dateTime=logTime.logTime[i].time;
			var logType=logTime.logTime[i].logType;
			var dateId=$filter('date')(new Date(dateTime), 'd');
			var logMonth=$filter('date')(new Date(dateTime), 'MM');
				var date1=new Date();
				var currentMonth=1+date1.getMonth();
				
				var testDate=myArray[i];
				
			
			if(currentMonth==logMonth)
			{
				if(-1!=myArray.indexOf(dateId))
				{
					if(logType=='In')
					{
						var my=$filter('date')(new Date(dateTime), 'h:mm');
						if(tempDateIn==dateId)
						{
							
						}	
						else
						{
							inLog=dateTime;
							document.getElementById("dateIn"+dateId).innerHTML=my;
						}
						tempDateIn=dateId;
					}else{
						
						var my=$filter('date')(new Date(dateTime), 'h:mm');
						if(tempDateOut==dateId)
						{
							    outLog=dateTime;
								document.getElementById("dateOut"+dateId).innerHTML=my;
								var totalAvgHrs=HoursCalc.getTotalTime(inLog,outLog);
								document.getElementById("avg"+dateId).innerHTML=totalAvgHrs;
								
								var avgHrs=totalAvgHrs.split(":");
								if(9<=parseInt(avgHrs[0]))
								{
									document.getElementById("avg"+dateId).parentElement.className="col col-13 balanced"
								}else
								{
									document.getElementById("avg"+dateId).parentElement.className="col col-13 assertive"
								}
						}	
						else
						{
							outLog=dateTime;
							document.getElementById("dateOut"+dateId).innerHTML=my;
							var totalAvgHrs=HoursCalc.getTotalTime(inLog,outLog);
							document.getElementById("avg"+dateId).innerHTML=totalAvgHrs;
							
							var avgHrs=totalAvgHrs.split(":");
							if(9<=parseInt(avgHrs[0]))
							{
								document.getElementById("avg"+dateId).parentElement.className="col col-13 balanced"
							}else
							{
								document.getElementById("avg"+dateId).parentElement.className="col col-13 assertive"
							}
								
						}
						tempDateOut=dateId;
						
						
						
					}
				}
			}
		}
	})
	
	
	$scope.mytask = [];
	$scope.mytask = Service.getMyTaskAssignedList();
	
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
			return ""+hours+":"+minutes+"";
		}
      };
    }
]);
