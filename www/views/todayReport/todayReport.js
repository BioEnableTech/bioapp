angular.module('App').controller('todayReportController', function($scope,$interval, HoursCalc, HoursDayAvg, $timeout, Util,$state, $rootScope, $localStorage, Popup, $filter, $ionicPopover, $ionicModal, $timeout, Utils, Watchers, Service, $ionicTabsDelegate, $ionicHistory) {
	
	
	
	$rootScope.changeMemu = function(stateTo) {
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

	
	$scope.progressPercent = 0
	$scope.amnt = 0

	
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
	var todayIn="";
	var todayOut="";
	
	firebase.database().ref('logs/' + empId).once('value', function(accountName) {
		logTime=accountName.val();
		for(var i=0;i<logTime.logTime.length;i++)
		{
			var dateTime=logTime.logTime[i].time;
			var logType=logTime.logTime[i].logType;
			var dateId=$filter('date')(new Date(dateTime), 'd');
			var today=$filter('date')(new Date(), 'd');
			var logMonth=$filter('date')(new Date(dateTime), 'MM');
				var date1=new Date();
				var currentMonth=1+date1.getMonth();
			
			if(currentMonth==logMonth)
			{
				if(today==dateId)
				{
					if(logType=='In')
					{
						$scope.myIn=$filter('date')(new Date(dateTime), 'h:mm a');
						todayIn=dateTime;
					}
					else{
						
						$scope.myOut=$filter('date')(new Date(dateTime), 'h:mm a');
						todayOut=dateTime;
						tempDateOut=dateId;
					}
				}
				
				if(todayOut=="")
				{
					todayOut=new Date();
					$scope.myOut=$filter('date')(new Date(), 'h:mm a')
					var test=parseInt(HoursDayAvg.getTotalTime(todayIn,todayOut));
					$scope.totalAvgHrs=HoursCalc.getTotalTime(todayIn,new Date());
					var percent=parseInt((test/540)*100);
					  function startprogress()
					  {
						$scope.progressPercent = 0;
						if ($scope.stopinterval)
						{
						  $interval.cancel($scope.stopinterval);
						}
						$scope.stopinterval = $interval(function() {
							  $scope.progressPercent = $scope.progressPercent + 1;
							   if( $scope.progressPercent >= percent ) {
									 $interval.cancel($scope.stopinterval);
									 return;
								}
						 }, 100);
					  }
						startprogress();
				}else if(todayIn=="")
				{
					$scope.totalAvgHrs=HoursCalc.getTotalTime(new Date(),new Date());
					$scope.myIn=$filter('date')(new Date(), 'h:mm a');
					$scope.myOut="";
					var percent=0
					$scope.progressPercent = 0;
					  
				}else{
					
					var test=parseInt(HoursDayAvg.getTotalTime(todayIn,new Date()));
					$scope.totalAvgHrs=HoursCalc.getTotalTime(todayIn,new Date());
					
					var percent=parseInt((test/540)*100);
					  function startprogress()
					  {
						$scope.progressPercent = 0;
						if ($scope.stopinterval)
						{
						  $interval.cancel($scope.stopinterval);
						}
						$scope.stopinterval = $interval(function() {
							  $scope.progressPercent = $scope.progressPercent + 1;
							   if( $scope.progressPercent >= percent ) {
									 $interval.cancel($scope.stopinterval);
									 return;
								}
						 }, 100);
					  }
						startprogress();
				}
				
				
				
			}
		}
	})
	
	

})
.factory('HoursDayAvg', [
    function() {
      return {
        getTotalTime: function(timeStart,timeEnd) {
			var timeStart = new Date(timeStart).getTime();
			var timeEnd = new Date(timeEnd).getTime();
			var hourDiff = timeEnd - timeStart; //in ms
			var secDiff = hourDiff / 1000; //in s
			var minDiff = hourDiff / 60 / 1000; //in minutes
			
			return minDiff;
		}
      };
    }
]);
