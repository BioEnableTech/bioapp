// message.js
// This is the controller that handles the messages for a conversation.
'Use Strict';
angular.module('App').controller('messageController', function($scope, $ionicActionSheet, $state, $localStorage, Popup, Utils, $filter, $ionicScrollDelegate, $ionicHistory, Service, $timeout, $cordovaCamera) {
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
  });

  
	$scope.sendSmiley = function() {

	   // Show the action sheet
	   var hideSheet = $ionicActionSheet.show({
		 buttons: [
		   { text: '<b>Share</b> This' },
		   { text: 'Move' }
		 ],
		 destructiveText: 'Delete',
		 titleText: 'Modify your album',
		 cancelText: 'Cancel',
		 cancel: function() {
			  // add cancel code..
			  
			},
		 buttonClicked: function(index) {
		   return true;
		 }
	   });

	   $timeout(function() {
		 hideSheet();
	   }, 5000);

	};
  
  
  
  
  //Allow going back when back is selected.
  $scope.back = function() {
    $scope.canChangeView = true;
    $localStorage.friendId = undefined;
    $localStorage.conversationId = undefined;
    // $ionicHistory.goBack();
    $state.go('messages');
  };
  
  $scope.exit=function()
  {
	  ionic.Platform.exitApp();
  }

  $scope.$on('$ionicView.enter', function() {
    //Disable scroll to correctly orient the keyboard input for iOS.
    
   var isWebView = ionic.Platform.isWebView();
	
   if(isWebView)
   {
	cordova.plugins.Keyboard.disableScroll(true);
   }

    //Set scope variables to the selected conversation partner.
    if ($localStorage.friendId) {
      $scope.conversationName = Service.getFriend($localStorage.friendId).name;
      $scope.conversation = Service.getConversation($localStorage.friendId);
      if ($scope.conversation) {
        $scope.conversationId = $scope.conversation.id;
        $scope.messages = $scope.conversation.messages;
        $scope.unreadMessages = $scope.conversation.unreadMessages;
        
		var temp=0;
		
		for (var i = 0; i < $scope.messages.length; i++) 
		{
          
		  $scope.messages[i].profilePic = Service.getProfilePic($scope.messages[i].sender);
			if(temp==0)
			{
				temp=$filter('date')($scope.messages[i].rawDate, "yyyy-MM-dd");
				$scope.messages[i].myDate=$scope.messages[i].rawDate;  
			} 
			if(temp==$filter('date')($scope.messages[i].rawDate, "yyyy-MM-dd"))
			{
				if(temp==0)
				{
					$scope.messages[i].myDate="A";
				}
			}
			else
			{
				$scope.messages[i].myDate=$scope.messages[i].rawDate;
				temp=$filter('date')($scope.messages[i].rawDate, "yyyy-MM-dd");
			}
		  
        }
      }
      $scope.scrollBottom();
      if ($localStorage.conversationId) {
        $scope.conversationId = $localStorage.conversationId;
      }
    }

    //Update users read messages on Firebase.
    $scope.updateMessagesRead();
    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
	
  });

  //Broadcast from our Watcher that tells us that a new message has been added to the conversation.
  $scope.$on('messageAdded', function() {
    $scope.scrollBottom();
    $scope.updateMessagesRead();
    $timeout(function () {
      Service.setLastActiveDate($localStorage.conversationId, new Date());
	  
    });
  });

  //Broadcast from our Watcher that tells us that a new conversation has been made with the user, we then reload the view to accomodate the changes.
  $scope.$on('conversationAdded', function(event, args) {
    if (args.friendId == $localStorage.friendId) {
      $scope.canChangeView = true;
      $state.reload();
    } else {
      $scope.canChangeView = false;
    }
  });

  //Broadcast from our Utils.getPicture function that tells us that the image selected has been uploaded.
  $scope.$on('imageUploaded', function(event, args) {
    //Proceed with sending of image message.
	var isWebView = ionic.Platform.isWebView();
		if(isWebView)
		{
			var networkState = navigator.connection.type;

			if (networkState !== Connection.NONE) {
				$scope.sendMessage('image', args.imageUrl);
			}else{
				Utils.message(Popup.errorIcon, "Network not available");
			}
		}
		else{
			$scope.sendMessage('image', args.imageUrl);	
		}
    
  });

  //Send picture message, ask if the image source is gallery or camera.
  $scope.sendPictureMessage = function() {
	  
	var isWebView = ionic.Platform.isWebView();
	
   if(isWebView)
   {	  
		var popup = Utils.confirm('ion-link', 'Photo Message: Do you want to take a photo or choose from your gallery?', 'ion-images', 'ion-camera');
		popup.then(function(isCamera) {
		  var imageSource;
		  if (isCamera) {
			imageSource = Camera.PictureSourceType.CAMERA;
		  } else {
			imageSource = Camera.PictureSourceType.PHOTOLIBRARY;
		  }
		  //Show loading.
		  Utils.getPicture(imageSource);
		});
   }
   else
   {
	   Utils.message(Popup.errorIcon,Popup.cordovaError);
   }
	
	
  };

  //Send text message.
  $scope.sendTextMessage = function() {
    if ($scope.message != '') {
		var isWebView = ionic.Platform.isWebView();
		if(isWebView)
		{
			var my_media = new Media('/android_asset/www/audio/send_message.m4a');
			my_media.play();
			
			var networkState = navigator.connection.type;

			if (networkState !== Connection.NONE) {
				$scope.sendMessage('text', $scope.message);
			}else{
				Utils.message(Popup.errorIcon, "Network not available");
			}
			
		}
		else{
			$scope.sendMessage('text', $scope.message);
		}
		
	}
  };

  //Scroll to bottom so new messages will be seen.
  $scope.scrollBottom = function() {
    $ionicScrollDelegate.scrollBottom(true);
  };

  //Scroll to top.
  $scope.scrollTop = function() {
    $ionicScrollDelegate.scrollTop(true);
  };

  //Send message, create Firebase data.
  $scope.sendMessage = function(type, message) {
	  
    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      var hasConversation = false;
      var conversations = account.val().conversations;
      if(conversations) {
        for(var i = 0; i < conversations.length; i++) {
          if(conversations[i].friend == $localStorage.friendId) {
            hasConversation = true;
          }
        }
      } else {
        hasConversation = false;
      }

      if(hasConversation) {
        //Has existing conversation
        firebase.database().ref('conversations/' + $scope.conversationId).once('value', function(conversation) {
          var messages = conversation.val().messages;
          if (!messages) {
            messages = [];
          }
          if (type == 'text') {
			    var ref = firebase.database().ref('accounts/' + $localStorage.friendId).child('tokenID');
				ref.once('value', function(accountID){
					var isWebView = ionic.Platform.isWebView();
					if(isWebView)
					{
						var ref = firebase.database().ref('accounts/' + $localStorage.accountId).child('name');
						ref.once('value', function(friendName){
								Service.sendNotification(message, friendName.val(),accountID.val());
						});
					}
				});
			messages.push({
              sender: $localStorage.accountId,
              message: message,
              date: Date(),
              type: 'text'
            });
          } else {
            messages.push({
              sender: $localStorage.accountId,
              image: message,
              date: Date(),
              type: 'image'
            });
          }
          firebase.database().ref('conversations/' + $scope.conversationId).update({
            messages: messages
          });
        });
      } else {
        //Create new conversation
        var users = [$localStorage.accountId, $localStorage.friendId];
        var messages = [];
        if (type == 'text') {
          messages.push({
            sender: $localStorage.accountId,
            message: message,
            date: Date(),
            type: 'text'
          });
        } else {
          messages.push({
            sender: $localStorage.accountId,
            image: message,
            date: Date(),
            type: 'image'
          });
        }

        var conversationId = firebase.database().ref('conversations').push({
          users: users,
          messages: messages,
          dateCreated: Date()
        }).key;

        firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
          var conversations = account.val().conversations;
          if (!conversations) {
            conversations = [];
          }
          conversations.push({
            friend: $localStorage.friendId,
            conversation: conversationId,
            messagesRead: 1
          });
          firebase.database().ref('accounts/' + $localStorage.accountId).update({
            conversations: conversations
          });
        });

        firebase.database().ref('accounts/' + $localStorage.friendId).once('value', function(account) {
          var conversations = account.val().conversations;
          if (!conversations) {
            conversations = [];
          }
          conversations.push({
            friend: $localStorage.accountId,
            conversation: conversationId,
            messagesRead: 0
          });
          firebase.database().ref('accounts/' + $localStorage.friendId).update({
            conversations: conversations
          });
        });
        $scope.conversationId = conversationId;
      }
      //Clear, and refresh to see the new messages.
      $scope.message = '';
      $scope.scrollBottom();
    });
  };

  //Enlarge selected image when selected on view.
  $scope.enlargeImage = function(url) {
    Utils.image(url);
  };

  //Update users messagesRead on Firebase database.
  $scope.updateMessagesRead = function() {
    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      var conversations = account.val().conversations;
      if(conversations) {
        angular.forEach(conversations, function(conversation) {
          if (conversation.conversation == $scope.conversationId) {
            conversation.messagesRead = $scope.messages.length;
		 }
        });
        firebase.database().ref('accounts/' + $localStorage.accountId).update({
          conversations: conversations
        });
		
		var isWebView = ionic.Platform.isWebView();
		if(isWebView)
		{
			//var my_media = new Media('/android_asset/www/audio/send_message.m4a', function() { alert("Audio Success"); }, function(err) { alert("Audio Error: "+ err.code); });
			var my_media = new Media('/android_asset/www/audio/send_message.m4a');
			my_media.play();
			my_media.release();	
		}
		
      }
    });
	
	
	
	
  };
});
