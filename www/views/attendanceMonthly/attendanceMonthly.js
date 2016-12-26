// groups.js
// This is the controller that handles the groups of the user.
// Selecting a group will open the group chat.
'Use Strict';
angular.module('App').controller('attendanceMonthlyController', function($scope,$timeout,$filter, $http, $rootScope, $http, $ionicSideMenuDelegate, $rootScope, $state, $localStorage, Utils, Popup, $timeout, Service, Watchers, $ionicTabsDelegate, $ionicHistory) {

  
  $rootScope.changeMemu = function(stateTo) {
    //alert(stateTo);
	$scope.changeTab(stateTo)
 };
  
  
  
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
	var day = date.getDay();  
	var firstDay = new Date(y, m, 1);
	var lastday = new Date(y, m + 1, 0);
	
	var mdays=[];
	
	var mntName=['January','February','March','April','May','June','July','August','September','October','November','December'];
	var weekDays=[ 'Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday','Friday','Saturday'];
	 
	 
	$scope.year=y;
	$scope.month=mntName[m];
	
	var f= firstDay.getDay();
	var l= lastday.getDate();
	
	
	
	
	
  
	$timeout(callAtTimeout, 1000);

	function callAtTimeout() {
	// Time code
		var hours = new Date().getHours();
		var minutes = new Date().getMinutes();
		var ampm = hours >= 12 ? 'PM' : 'AM';
		var second = new Date().getSeconds();
		hours = hours % 12;
		hours = hours ? hours : 12; 
		minutes = minutes < 10 ? '0' + minutes : minutes;
		var strTime = hours + ' : ' + minutes + ' : ' + second + ' ' + ampm;	
		
	  $scope.cuurentTime=strTime;
	  $scope.cuurentDate=weekDays[day]+", "+d+" "+mntName[m]+" "+y;
	  
	  $timeout(callAtTimeout, 1000);
	}
  
  
  
  
  
  
 
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
    $ionicTabsDelegate.select(4);
  });

 
 
 

	
	
	var myTable="<table>";
	myTable=myTable+"<tr><td>Sun</td><td>Mon</td><td>Tue</td><td>Wed</td><td>Thu</td><td>Fri</td><td>Sat</td></tr>";
	myTable=myTable+"<tr>";
	var cnt=1;
	for(var i=1;i<=l;i++)
	{ 
		if(cnt%7==1)
		{
			myTable=myTable+"</tr><tr>";
		}
		if(cnt<f)
		{
			for(var j=0;j<f;j++)
			{
				myTable=myTable+"<td> </td>";
				cnt++;
			}
		}
		if(cnt==8 || cnt==15 || cnt==22 || cnt==29 || cnt%14==0)
		{
			myTable=myTable+"<td class='cal_td_date tooltip'><span class='tooltiptextp'>Week Off</span><span id="+i+" class='badge timeline-badge pink'>"+i+"</span></td>";cnt++;	
		}else
		{
			myTable=myTable+"<td class='cal_td_date tooltip'><span class='tooltiptextin'>No Data</span><span id="+i+" class='badge timeline-badge inverse'>"+i+"</span></td>";cnt++;
		}
	}
	myTable=myTable+"</tr></table>";	
	document.getElementById('monthlyCalendar').innerHTML=myTable;


	var empId;
	firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
		empId=snapshot.val();
	});
	var LogsData=[];
	var tempDate='a';
	var myItem=[];
	
	firebase.database().ref('logs/' + empId).once('value', function(accountName) {
		logTime=accountName.val();
		for(var i=0;i<logTime.logTime.length;i++)
		{
			var dateTime=logTime.logTime[i].time;
			var dateId=$filter('date')(new Date(dateTime), 'd');
			var logMonth=$filter('date')(new Date(dateTime), 'MM');
				var date1=new Date();
				var currentMonth=1+date1.getMonth();
			if(currentMonth==logMonth)
			{
				tempDate=dateId;
				document.getElementById(dateId).className = "badge timeline-badge info";
				document.getElementById(dateId).parentElement.className="cal_td_date tooltip"
				document.getElementById(dateId).parentElement.innerHTML="<span class='tooltiptexti'>Present</span><span id='"+tempDate+"' class='badge timeline-badge info'>"+tempDate+"</span><br>";
			}
		}
	
	})
	
	
	firebase.database().ref('leave/' + $localStorage.accountId +"/applied").once('value', function(accountName) {
		applied=accountName.val().applied;
		accountName.forEach(function(childSnapshot) {
		var childData = childSnapshot.val();
			if(childData.status=='approved')
			{
				
				var dateTime=childData.startDate;
				var dateId=$filter('date')(new Date(dateTime), 'd');
				var logMonth=$filter('date')(new Date(dateTime), 'MM');
					var date1=new Date();
					var currentMonth=1+date1.getMonth();
				if(currentMonth==logMonth)
				{
					tempDate=dateId;
					document.getElementById(dateId).className = "badge timeline-badge success";
					document.getElementById(dateId).parentElement.className="cal_td_date tooltip"
					document.getElementById(dateId).parentElement.innerHTML="<span class='tooltiptexts'>Leave</span><span id='"+tempDate+"' class='badge timeline-badge success'>"+tempDate+"</span><br>";
				}
				
			}
		})
	});
	
	
	
});





