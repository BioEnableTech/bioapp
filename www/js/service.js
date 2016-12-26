//service.js
//This is the class where most of the data shown on the views are stored.
//Changes done on the Firebase Database through the Watchers (watcher.js) should be reflected on this service.
angular.module('App').service('Service', function($localStorage, $rootScope, HoursCalc, $http, $filter,$cordovaLocalNotification, Utils, Popup, $ionicPlatform) {
  var data = {
    usersList: [],
    excludedIds: [],
    assignedIds: [],
    profile: {},
    conversationList: [],
    groupList: [],
    friendList: [],
    unreadMessages: 0,
    unreadGroupMessages: 0,
    friendRequestList: [],
    requestSentList: [],
	manualLogList:[],
    friendRequests: 0,
	taskAssignedList:[],
	myTaskAssignedList:[],
	accountList : [],
	Supervisor : [],
	leaveApplication:[],
	LogsData:[]
  };
  		
  
  // Local Notification 
  this.sendLocalNotification = function(msg) {
    
    	var now = new Date().getTime();
		var _5SecondsFromNow = new Date(now + 1000);
		$cordovaLocalNotification.schedule({
			id: 2,
			date: _5SecondsFromNow,
			text: ' '+msg,
			title: 'After 5 Seconds'
		}).then(function () {

		});
	
  };
  
  
  //Push Notification code 
	this.sendNotification = function(body,title,token) {
    
		var parameter = JSON.stringify({
			  "notification":{
				"title":""+title+"",  
				"body":"Message:"+body+"",  
				"sound":"default", 
				"click_action":"FCM_PLUGIN_ACTIVITY", 
				"icon":"fcm_push_icon" , 
				"priority":"high"
			  },
			"to":token, 
			"restricted_package_name":"" 
		});
    	
		$http({
			url: 'https://fcm.googleapis.com/fcm/send',
			dataType: 'json',
			method: 'POST',
			data: parameter,
			headers: {
				"Content-Type": "application/json",
				"Authorization": "key=AIzaSyCBO-Jt_MfArm3K5qw2LXaova_0YTwnpAs"	}
	
			}).then(function mySucces(response) {
				  console.log(response.data);
				}, function myError(response) {
				  console.log(response.statusText);
				});
			
		return data.friendList;
	
  };
  
  this.clearData = function() {
    data.usersList = [];
    data.excludedIds = [];
    data.assignedIds = [];
    data.profile = {};
    data.conversationList = [];
    data.groupList = [];
    data.friendList = [];
    data.unreadMessages = 0;
    data.unreadGroupMessages = 0;
    data.friendRequestList = [];
    data.requestSentList = [];
	data.manualLogList = [];
	data.friendRequests = 0;
	data.taskAssignedList=[];
	data.leaveApplication=[];
	
  };
  //Add user to the usersList, only adds if user doesn't exist yet.
  this.addUser = function(profile) {
    var index = -1;
    for(var i = 0; i < data.usersList.length; i++) {
      if(data.usersList[i].id == profile.id)
        index = i;
    }
    if(index == -1) {
      if(profile.name && profile.username)
        data.usersList.push(profile);
    }

  };
  //Return usersList.
  this.getUsersList = function() {
    return data.usersList;
  };
  //Add to excludedIds, excludedIds are ids that should not show up on search Users. Your own profile and your existing friends are excludedIds.
  this.addExcludedIds = function(id) {
    data.excludedIds.push(id);
  };
  
  
  
  //Remove from excludedIds.
  this.removeFromExcludedIds = function(id) {
    if (data.excludedIds.length > 0) {
      data.excludedIds.splice(data.excludedIds.indexOf(id), 1);
    }
  };
  
  //Get excludedIds.
  this.getExcludedIds = function() {
    return data.excludedIds;
  };
  //Add to assignedIds, assignedIds are ids for members/friends that are already assigned to a group.
  this.addAssignedIds = function(id) {
    data.assignedIds.push(id);
  };
  //Remove from assignedIds.
  this.removeFromAssignedIds = function(id) {
    if (data.assignedIds.length > 0) {
      data.assignedIds.splice(data.assignedIds.indexOf(id), 1);
    }
  };
  //Clear assignedIds.
  this.clearAssignedIds = function(id) {
    data.assignedIds = [];
  };
  //Get assignedIds.
  this.getAssignedIds = function() {
    return data.assignedIds;
  };
  //Set Profile with the profile object.
  this.setProfile = function(profile) {
    data.profile = profile;
  };
  //Get the profile.
  this.getProfile = function() {
    return data.profile;
  };
  //Get profilePic given the id.
  this.getProfilePic = function(id) {
    if ($localStorage.accountId == id) {
      return data.profile.profilePic;
    } else {
      for (var i = 0; i < data.friendList.length; i++) {
        if (data.friendList[i].id == id) {
          return data.friendList[i].profilePic;
        }
      }
      for (var i = 0; i < data.usersList.length; i++) {
        if (data.usersList[i].id == id) {
          return data.usersList[i].profilePic;
        }
      }
    }
  };
  //Get profileName given the id.
  this.getProfileName = function(id) {
    if ($localStorage.accountId == id) {
      return data.profile.name.substr(0, data.profile.name.indexOf(' '));
    } else {
      for (var i = 0; i < data.friendList.length; i++) {
        if (data.friendList[i].id == id) {
          return data.friendList[i].name.substr(0, data.friendList[i].name.indexOf(' '));
        }
      }
      for (var i = 0; i < data.usersList.length; i++) {
        if (data.usersList[i].id == id) {
          return data.usersList[i].name.substr(0, data.usersList[i].name.indexOf(' '));
        }
      }
    }
  };
  //Add conversation.
  this.addConversation = function(conversation) {
    data.conversationList.push(conversation);
  };
  //Add message to a conversation.
  this.addMessageToConversation = function(conversationId, message) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].id == conversationId) {
        var messages = data.conversationList[i].messages;
        messages.push(message);
        data.conversationList[i].messages = messages;
        var lastMessage;
        if (message.type == 'text') {
          if (message.sender == $localStorage.accountId) {
            lastMessage = "You: " + message.message;
          } else {
            lastMessage = message.message;
          }
        } else {
          if (message.sender == $localStorage.accountId) {
            lastMessage = "You sent a photo message.";
          } else {
            lastMessage = "Sent you a photo message.";
          }
        }
        data.conversationList[i].lastMessage = lastMessage;
        if (message.sender != $localStorage.accountId) {
          data.conversationList[i].unreadMessages++;
          this.addUnreadMessages(1);
        }
      }
    }
  };
  //Update conversationFriend.
  this.updateConversationFriend = function(friend) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].friend.id == friend.id) {
        data.conversationList[i].friend = friend;
      }
    }
  };
  //Get conversationList.
  this.getConversationList = function() {
    return data.conversationList;
  };
  //Get conversation given the friend id.
  this.getConversation = function(friendId) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].friend.id == friendId) {
        return data.conversationList[i];
      }
    }
  };
  //Get conversation given its id.
  this.getConversationById = function(conversationId) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].id == conversationId) {
        return data.conversationList[i];
      }
    }
  };
  //Set lastActiveDate of conversation.
  this.setLastActiveDate = function(conversationId, date) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].id == conversationId) {
        data.conversationList[i].lastActiveDate = date;
      }
    }
  };
  //Get unreadMessages.
  this.getUnreadMessages = function() {
    return data.unreadMessages;
  };
  //Add Group.
  this.addGroup = function(group) {
    data.groupList.push(group);
  };
  //Add message to group.
  this.addMessageToGroup = function(groupId, message) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        var messages = data.groupList[i].messages;
        messages.push(message);
        data.groupList[i].messages = messages;
        if (message.sender != $localStorage.accountId) {
          data.groupList[i].unreadMessages++;
          this.addUnreadGroupMessages(1);
        }
      }
    }
  };
  //Get group List.
  this.getGroupList = function() {
    return data.groupList;
  };
  //Get group by its id.
  this.getGroupById = function(groupId) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        return data.groupList[i];
      }
    }
  };
  //Set group's lastActiveDate.
  this.setGroupLastActiveDate = function(groupId, date) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        data.groupList[i].lastActiveDate = date;
      }
    }
  };
  //Update group's users.
  this.updateGroupUsers = function(groupId, usersList) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        data.groupList[i].users = usersList;
      }
    }
  };
  //Remove user from group.
  this.removeGroupUser = function(groupId, userId) {
    var index = -1;
    var group;
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        group = data.groupList[i];
        for(var j = 0; j < group.users.length; j++) {
          if (group.users[j].id == userId){
            index = j;
          }
        }
      }
    }
    if(index > -1) {
      group.users.splice(index, 1);
    }
  };
  //Remove group when group is deleted.
  this.removeGroup = function(groupId) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        data.unreadGroupMessages-= data.groupList[i].unreadMessages;
        data.groupList.splice(i, 1);
        $localStorage.groupId = undefined;
      }
    }
  };
  //Set group image.
  this.setGroupImage = function(groupId, imageUrl) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        data.groupList[i].image = imageUrl;
      }
    }
  };
  //Get unreadGroupMessages.
  this.getUnreadGroupMessages = function() {
    return data.unreadGroupMessages;
  };
  //Add or update friend.
  this.addOrUpdateFriend = function(friend) {
    var index = -1;
    for (var i = 0; i < data.friendList.length; i++) {
      if (data.friendList[i].id == friend.id) {
        index = i;
      }
    }
    if (index >= 0) {
      data.friendList[index] = friend;
    } else {
      data.friendList.push(friend);
    }
  };
  //Get friend given its id.
  this.getFriend = function(friendId) {
    for (var i = 0; i < data.friendList.length; i++) {
      if (data.friendList[i].id == friendId) {
        return data.friendList[i];
      }
    }
  };
  //Get account given the accountId.
  this.getAccount = function(accountId) {
    for (var i = 0; i < data.usersList.length; i++) {
      if (data.usersList[i].id == accountId) {
        return data.usersList[i];
      }
    }
  };
  //Get friendList.
  this.getFriendList = function() {
    return data.friendList;
  };
  //Add to unreadMessages.
  this.addUnreadMessages = function(messagesCount) {
    if (!data.unreadMessages) {
      data.unreadMessages = messagesCount;
    } else {
      data.unreadMessages = data.unreadMessages + messagesCount;
    }
  };
  //Minus to unreadMessages.
  this.minusUnreadMessages = function(messagesCount) {
    if (!data.unreadMessages) {
      data.unreadMessages = messagesCount;
    } else {
      data.unreadMessages = data.unreadMessages - messagesCount;
    }
  };
  //Set unreadMessages.
  this.setUnreadMessages = function(conversationId, unreadMessages) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].id == conversationId) {
        data.conversationList[i].unreadMessages = unreadMessages;
      }
    }
  };
  //Add to Group unreadMessages.
  this.addUnreadGroupMessages = function(messagesCount) {
    if (!data.unreadGroupMessages) {
      data.unreadGroupMessages = messagesCount;
    } else {
      data.unreadGroupMessages = data.unreadGroupMessages + messagesCount;
    }
  };
  //Minus to Group unreadMessages.
  this.minusUnreadGroupMessages = function(messagesCount) {
    if (!data.unreadGroupMessages) {
      data.unreadGroupMessages = messagesCount;
    } else {
      data.unreadGroupMessages = data.unreadGroupMessages - messagesCount;
    }
  };
  //Set Group unreadMessages.
  this.setUnreadGroupMessages = function(groupId, unreadMessages) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        data.groupList[i].unreadMessages = unreadMessages;
      }
    }
  };
  
  
  //Add friendRequest.
  this.addFriendRequest = function(friendRequest) {
    data.friendRequestList.push(friendRequest);
    data.friendRequests++;
  };
  //Get friendRequest List.
  this.getFriendRequestList = function() {
    return data.friendRequestList;
  };
  //Remove friendRequest.
  this.removeFriendRequest = function(friendId) {
    var index = -1;
    for (var i = 0; i < data.friendRequestList.length; i++) {
      if (data.friendRequestList[i].id == friendId) {
        index = i;
        data.friendRequests--;
      }
    }
    if (index > -1) {
      data.friendRequestList.splice(index, 1);
    }
  };
  //Get friendRequest count.
  this.getFriendRequestsCount = function() {
    return data.friendRequests;
  };
  
  
  
  
  
  
  
  
  
  
  //Add requestSent.
  this.addRequestSent = function(friendRequest) {
    data.requestSentList.push(friendRequest);
  };
  //Remove requestSent.
  this.removeRequestSent = function(friendId) {
    var index = -1;
    for (var i = 0; i < data.requestSentList.length; i++) {
      if (data.requestSentList[i].id == friendId) {
        index = i;
      }
    }
    if (index > -1) {
      data.requestSentList.splice(index, 1);
    }
  };
  //Get requestSent List.
  this.getRequestSentList = function() {
    return data.requestSentList;
  };
  
  
  
  
  
  //Remove requestSent.
  //removeManualLogs name 
  
  this.removeManualLogs = function(friendId) {
    var index = -1;
    for (var i = 0; i < data.manualLogList.length; i++) {
      if (data.manualLogList[i].id == friendId) {
        index = i;
      }
    }
    if (index > -1) {
      data.manualLogList.splice(index, 1);
    }
  };
  
  /*//Get requestSent List.
  this.getRequestSentList = function() {
    return data.manualLogList;
  };*/
  
  
  
  
 
 //Get requestSent List.
  this.getTaskAssignedList = function() {
		data.taskAssignedList=[];
		firebase.database().ref('accounts/' + $localStorage.accountId+'/assignedTaskToMe').once('value', function(account) {
			
			account.forEach(function(childSnapshot) {
				var childData = childSnapshot.val();
				firebase.database().ref('task/'+childData).once('value', function(task) {
					var supervisorName;
					var taskTo;
					firebase.database().ref('accounts/' + task.val().from).once('value', function(accountName) {
						supervisorName=accountName.val().username;
						firebase.database().ref('accounts/' + task.val().to).once('value', function(accountName1) {
						taskTo=accountName1.val().username;
							data.taskAssignedList.push({
							Location : task.val().Location,
							taskKey:childData,
							subject:task.val().subject,
							description:task.val().description,
							startTime:task.val().startTime,
							startDate:task.val().startDate,
							endTime:task.val().endTime,
							totalTime :task.val().totalTime,
							dateCreated:$filter('date')(new Date(task.val().dateCreated), 'MMM dd'),
							from : supervisorName,
							status : task.val().status,
							taskType : task.val().taskType,
							to : taskTo,
							profilePic:accountName.val().profilePic
						});
						});
					})
				});
			});
		});
	return data.taskAssignedList;
  };
  
  this.getMyTaskAssignedList = function() {
		data.myTaskAssignedList=[];
		firebase.database().ref('accounts/' + $localStorage.accountId+'/assignedTask').once('value', function(account) {
			account.forEach(function(childSnapshot) {
				var childData = childSnapshot.val();
				firebase.database().ref('task/'+childData).once('value', function(task) {
					var supervisorName;
					var taskTo;
					firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(accountName) {
						supervisorName=accountName.val().username;
						firebase.database().ref('accounts/' + task.val().to).once('value', function(accountName1) {
						taskTo=accountName1.val().username;
							data.myTaskAssignedList.push({
							Location : task.val().Location,
							taskKey:childData,
							subject:task.val().subject,
							description:task.val().description,
							startTime:task.val().startTime,
							endTime:task.val().endTime,
							totalTime :task.val().totalTime,
							startDate:task.val().startDate,
							endDate:task.val().endDate,
							dateCreated:$filter('date')(new Date(task.val().dateCreated), 'MMM dd'),
							from : supervisorName,
							status : task.val().status,
							taskType : task.val().taskType,
							to : taskTo,
							profilePic:accountName.val().profilePic
						});
						});
					})
				});
			});
		});
	return data.myTaskAssignedList;
  };
  
   this.getDate = function(date) {
   
		var hours = new Date(date).getHours();
		var minutes = new Date(date).getMinutes();
		var ampm = hours >= 12 ? 'PM' : 'AM';
		var second = new Date(date).getSeconds();
		hours = hours % 12;
		hours = hours ? hours : 12; 
		minutes = minutes < 10 ? '0' + minutes : minutes;
		var strTime = hours + ' : ' + minutes + ' : ' + second + ' ' + ampm;
		return strTime;
	
   }
   
   
   this.getLogsData = function()
   {
	   
	    var timeStart = new Date("Mon Jan 01 2007 11:00:00 GMT+0530").getTime();
		var timeEnd = new Date("Mon Jan 01 2007 11:30:00 GMT+0530").getTime();
		//HoursCalc.getTotalTime(timeStart,timeEnd);
	   
	    var empId;
		firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
			empId=snapshot.val();
		});
		var LogsData=[];
		var tempDate='a';
		var myItem=[];
		var myItemDate=[];
		
		firebase.database().ref('logs/' + empId).orderByValue().once('value', function(accountName) {
			logTime=accountName.val();
			
			var i;
			for(i=0;i<logTime.logTime.length;i++)
			{
				var dateTime=logTime.logTime[i].time;
				var dateId=$filter('date')(new Date(dateTime), 'dd');
				var logMonth=$filter('date')(new Date(dateTime), 'MM');
				var date=new Date();
				var currentMonth=1+date.getMonth();
				
				
				var nextDate;
				if(i<logTime.logTime.length-1)
				{
					nextDate=$filter('date')(new Date(logTime.logTime[i+1].time), 'dd');
				}	
				
				
				
				if(logMonth==currentMonth)
				{
					var tmp=$filter('date')(new Date(dateTime), 'h:mm a');
					myItemDate.push(dateTime);
					myItem.push({"logTime":tmp,"logStatus":logTime.logTime[i].logStatus,"logType":logTime.logTime[i].logType});
					
					if(nextDate.toString()!=dateId.toString())
					{

						var totalHours=HoursCalc.getTotalTime(myItemDate[0],myItemDate[myItemDate.length-1]);
						data.manualLogList.push({
							date:$filter('date')(new Date(dateTime), 'yyyy-MM-dd'),
							inTime:$filter('date')(new Date(dateTime), 'h:mm a'),
							items : myItem,
							logLocation : logTime.logTime[i].location,
							logStatus : logTime.logTime[i].logStatus,
							totalHours : totalHours
						})
						myItem=[];
						myItemDate=[];
					}
					else if(i==logTime.logTime.length-1)
					{
						var totalHours=HoursCalc.getTotalTime( myItemDate[0], myItemDate[myItemDate.length-1]);
						data.manualLogList.push({
							date:$filter('date')(new Date(dateTime), 'yyyy-MM-dd'),
							inTime:$filter('date')(new Date(dateTime), 'h:mm a'),
							items : myItem,
							logLocation : logTime.logTime[i].location,
							logStatus : logTime.logTime[i].logStatus,
							totalHours : totalHours
						})
						myItem=[];
						myItemDate=[];
					}
				}
				
				
			}
					
		})
	   
	   return data.manualLogList;
	   
   }
   
    this.getLogsDataLength = function()
    {
		var empId;
		var logLength;
		// var cnt=0;
		cnt=0;
		firebase.database().ref('accounts/' + $localStorage.accountId+"/empId").on("value", function(snapshot){
			empId=snapshot.val();
		});
		
		firebase.database().ref('logs/' + empId).on('value', function(accountName) {
			logLength=parseInt(accountName.val().logTime.length);
			var mydata=accountName.val().logTime;
			currentDate=new Date();
			d = currentDate.getDate();
			for(var i=0;i<logLength;i++)
			{
				var date1=$filter('date')(new Date(accountName.val().logTime[i].time), 'dd');
				if(d==date1)
				{
					cnt++;
				}
			}
		});
	
		return cnt
		//for total days // return logLength;
	}
		
   
	this.getAccountList = function() {
		data.accountList=[];
		firebase.database().ref('accounts/').once('value', function(account) {
			account.forEach(function(childSnapshot) {
			var childData = childSnapshot.val();
				var id=childSnapshot.key;
				if(childData.name!=undefined)
				{
					data.accountList.push({
					userName : childData.name,
					id:id
					});
				}
			});
		});
	return data.accountList;
  };
  
    this.getSupervisorTree = function() {
		var supervisorName;
		var key;
		firebase.database().ref('accounts/' + $localStorage.accountId+"/supervisor").on("value", function(snapshot){
			key=snapshot.val();
		});
		firebase.database().ref('accounts/'+key).once('value', function(account) {
			supervisorName = account.val().name;
		});
	return supervisorName;
   };
  
  
   this.getManualLogsData = function()
   {
	   
	    var empIdVal;
		data.LogsData=[];
		var tempDate='a';
		var myItem=[];
		var j=0;
		var empID;
		
		firebase.database().ref('accounts/' + $localStorage.accountId+"/userList/").on("value", function(snapshot){
			empIdVal=snapshot.val();
				
			for(j=0;j<empIdVal.length;j++)
			{
				var userName="";
				var userEmp;
				empIDTest=empIdVal[j].empId;
				
				firebase.database().ref('accounts/'+ empIdVal[j].userKey).once('value', function(accountName) {
					userName=accountName.val().name;
					userEmp=accountName.val().empId;
				});
				
							
				firebase.database().ref('logs/' + empIDTest).once('value', function(accountName) {
					logTime=accountName.val();
					
					var i;
					for(i=0;i<logTime.logTime.length;i++)
					{
						var dateTime=logTime.logTime[i].time;
						var dateId=$filter('date')(new Date(dateTime), 'dd');
						var nextDate;
						if(i<logTime.logTime.length-1)
						{
							nextDate=$filter('date')(new Date(logTime.logTime[i+1].time), 'dd');
						}
						var tmp=$filter('date')(new Date(dateTime), 'h:mm a');
						myItem.push({"logTime":tmp,"logStatus":logTime.logTime[i].logStatus,"logType":logTime.logTime[i].logType});
						if(nextDate.toString()!=dateId.toString())
						{
							if(logTime.logTime[i].logStatus=='invalid')
							{	
						
								data.LogsData.push({
									date:$filter('date')(new Date(dateTime), 'yyyy-MM-dd'),
									inTime:$filter('date')(new Date(dateTime), 'h:mm a'),
									items : myItem,
									logLocation : logTime.logTime[i].location,
									logStatus : logTime.logTime[i].logStatus,
									userName : userName,
									empId1 : userEmp
								})
								myItem=[];
							}
						}
						else if(i==logTime.logTime.length-1)
						{
							if(logTime.logTime[i].logStatus=='invalid')
							{	
								data.LogsData.push({
									date:$filter('date')(new Date(dateTime), 'yyyy-MM-dd'),
									inTime:$filter('date')(new Date(dateTime), 'h:mm a'),
									items : myItem,
									logLocation : logTime.logTime[i].location,
									logStatus : logTime.logTime[i].logStatus,
									userName : userName,
									empId1 : userEmp
								})
								myItem=[];
							}
						}
					}
				})
			}
		});
		
		return data.LogsData;
		
		
	   
   }
   
   this.getManualLogsUpdate=function(date,time,emp)
   {
	   
	   firebase.database().ref('logs/' + emp).once('value', function(accountName) {
			logTime=accountName.val();
			var i;
			for(i=0;i<logTime.logTime.length;i++)
			{
				var dateTime=logTime.logTime[i].time;
				var dateId=$filter('date')(new Date(dateTime), 'dd');
				var dateCurrent=$filter('date')(new Date(date), 'dd');
				var tmp=$filter('date')(new Date(dateTime), 'h:mm a');
				
				if(tmp.toString()==time.toString() && dateCurrent.toString()==dateId.toString())
				{
					firebase.database().ref('logs/' + emp +"/logTime/"+i+"/").update({
						logStatus: "approved"
					}, function(error) {
						  if (error) {
							Utils.hide();
							Utils.message(Popup.successIcon, "Log approving failed.");
						  } else {
							Utils.hide();
							Utils.message(Popup.successIcon, "Log is approved.");
							$rootScope.$broadcast('logsDisplay');
							/*$scope.canChangeView = true;
							$scope.changeTab('supervisor');*/
						  }
						});
				}
			}
		})
		
		
   }
  
  
	this.upDateLeaveApplication=function(userKey,sDate,eDate)
	{
	  firebase.database().ref('leave/' + userKey +"/applied").once('value', function(accountName) {
		applied=accountName.val().applied;
		var i=0;
		accountName.forEach(function(childSnapshot) {
		var childData = childSnapshot.val();
			
			if(childData.startDate==sDate && childData.endDate==eDate)
			{
				firebase.database().ref('leave/' + userKey +"/applied/"+i).update({
					status: "approved"
				}, function(error) {
					  if (error) {
						Utils.hide();
						Utils.message(Popup.successIcon, "Log approving failed.");
					  } else {
						Utils.hide();
						Utils.message(Popup.successIcon, "Leave is approved.");
					  }
					});
			}
			i++;
		})
	  });
	}
  
  
  
  
   this.getLeaveApplicationData = function()
   {
	   
	   var leaveApplication=[];
  
	  firebase.database().ref('accounts/' + $localStorage.accountId+"/userList/").on("value", function(snapshot){
				
				empIdVal=snapshot.val();
				var userName="";			
					
					
				for(j=0;j<empIdVal.length;j++)
				{
					
					var userEmp;
					empIDTest=empIdVal[j].empId;
					
					
					firebase.database().ref('accounts/' + empIdVal[j].userKey).on("value", function(snapshot){
						userName=snapshot.val().name;
					})
					
					
					
					firebase.database().ref('leave/' + empIdVal[j].userKey+"/applied").once('value', function(accountName) {
						applied=accountName.val().applied;
						
						accountName.forEach(function(childSnapshot) {
						var childData = childSnapshot.val();
							
							if(childData.status=='false')
							{
								var id=empIdVal[j].userKey;
									leaveApplication.push({
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
				console.log(data.leaveApplication);
				
				return leaveApplication;
				
	  });
	   
	   
   }
  
  
  
});
