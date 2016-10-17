angular.module('app.services', [])

.factory("Auth", ["$rootScope",
    function($rootScope) {
        return auth;
    }
])


.factory('Chats', ['$rootScope', 'Rooms', 'Users','$ionicPopup', function($rootScope, Rooms, Users,$ionicPopup) {
	
    var selectedRoomId;
	var selectedUserId;
    var ref = rootRef;
   
	var chats;
	var msg;
    $rootScope.chatsGetRoom = [];
	$rootScope.chatsGetUser = [];
    // use for multiple apply
    $rootScope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };



    return {
        all: function() {
            return chats;
        },
		
        remove: function(chat) {
            if (displayNames == chat.from) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Delete Message',
                    template: 'Are you sure you want to delete this message?'
                });

                confirmPopup.then(function(res) {
                    if (res) {
                        chats.child(chat.genKey).remove(function(success) {});
                    } else {}
                });
            } else if (displayNames == 'noname') {
                alert('Please login first!!!');
            } else {
                alert('This is not the your message');
            }

        },
        get: function(chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].id === parseInt(chatId)) {
                    return chats[i];
                }
            }
            return null;
        },
        getSelectedRoomName: function() {
            var selectedRoom;
            $rootScope.roomSelected = '';
            if (selectedRoomId && selectedRoomId != null) {
                selectedRoom = Rooms.get(selectedRoomId);


                if (selectedRoom)
                    selectedRoom.then(function(data) {
                        $rootScope.safeApply(function() {
                            $rootScope.roomSelected = data.val().name;
                        });
                    });
                else
                    return null;
            } else
                return null;
        },
		
        selectRoom: function(roomId) {
            selectedRoomId = roomId;
            if (!isNaN(roomId)) {
                chats = rootRef.child('rooms').child(selectedRoomId).child('chats');
                rootRef.child('rooms').child(selectedRoomId).child('chats').on('value', function(data) {
                    if (data.val() === null) {
                        $rootScope.safeApply(function() {
                            $rootScope.chatsGetRoom = [];
                        });
                    } else {
                        $rootScope.chatsGetRoom = [];
                        data.forEach(function(dataChild) {
                            $rootScope.safeApply(function() {
                                $rootScope.chatsGetRoom.push({
                                    genKey: dataChild.val().genKey,
                                    from: dataChild.val().from,
                                    message: dataChild.val().message,
                                    createdAt: dataChild.val().createdAt
                                })
                            })
                        });
                    }
                });
            }
        },
		
        send: function(from, message) {
            alert(chats);
			if (from && message) {
				var genKey = chats.push().key;
                rootRef.child('rooms').child(selectedRoomId).child('chats/' + genKey).set({
                    genKey: genKey,
                    from: from,
                    message: message,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });
            }
        },
		
		
		
		allUser: function() {
            return msg;
        },
		getUser: function(userId) {
            for (var i = 0; i < msg.length; i++) {
                if (msg[i].id === parseInt(userId)) {
                    return msg[i];
                }
            }
            return null;
        },
		getSelectedUserName: function(selectedUser) {
            var selectedUser;
            $rootScope.userSelected = '';
			
				var userName=rootRef.child('users').child(selectedUser).on('value', function(data) {
                    
					var userName = data.val().displayname;
					$rootScope.userSelected=data.val().displayname;
					
					
					
                });
			
			    return userName;
        },
		selectUser: function(myId,userId) 
		{
            selectedUserId = userId;
			currentUserId = myId;
			
			if (isNaN(userId)) 
			{
				$rootScope.chatsGetUsers = [];
				msg = rootRef.child('users').child(selectedUserId).child('messages').child(currentUserId);
                rootRef.child('users').child(selectedUserId).child('messages').child(currentUserId).on('value', function(data) {
                        
                        data.forEach(function(dataChild) {
                            $rootScope.safeApply(function() {
                                $rootScope.chatsGetUsers.push({
                                    genKey: dataChild.val().genKey,
                                    from: dataChild.val().from,
                                    message: dataChild.val().message,
                                    createdAt: dataChild.val().createdAt
                                })
							})
                        });
                    
                });
				rootRef.child('users').child(currentUserId).child('messages').child(selectedUserId).on('value', function(data) {
                        data.forEach(function(dataChild) {
                            $rootScope.safeApply(function() {
                                $rootScope.chatsGetUsers.push({
                                    genKey: dataChild.val().genKey,
                                    from: dataChild.val().from,
                                    message: dataChild.val().message,
                                    createdAt: dataChild.val().createdAt
                                })
						    })
                        });
                    
                });
				
            }
        },
		sendUser: function(from, message) {
			if (from && message) {
				var genKey = rootRef.child('users').child(selectedUserId).child('messages').child(currentUserId).push().key;
				rootRef.child('users').child(selectedUserId).child('messages').child(currentUserId+'/' + genKey).set({
                    genKey: genKey,
                    from: from,
                    message: message,
                    createdAt: Firebase.ServerValue.TIMESTAMP
                });
            }
        }
		
    }
	
}])


.factory('Rooms', function($rootScope) {


    // Created data Rooms
    /* var dataRooms = [{
         id: 1,
         icon: 'ion-university',
         name: 'Academics'
     },{
         id: 2,
         icon: 'ion-camera',
         name: 'Photography'
     },{
         id: 3,
         icon: 'ion-music-note',
         name: 'Music'
     },{
         id: 4,
         icon: 'ion-woman',
         name: 'Fashion'
     },{
         id: 5,
         icon: 'ion-plane',
         name: 'Travel'
     }];
	 
     for (var i = 0; i < dataRooms.length; i++) {
         var newPostKey = rootRef.child('rooms').push().key;
         rootRef.child('rooms/' + dataRooms[i].id).set({
             id: dataRooms[i].id,
             codeId: newPostKey,
             icon: dataRooms[i].icon,
             name: dataRooms[i].name
         }).then(function(data){
    //         //console.log(data);
         },function(err){
             //console.log(err);
         });
     }
	 */
    // End Created Data rooms

    var allRoom = rootRef.child("rooms").once('value');

    return {
        all: function() {
            // get all room
            return allRoom;
        },
        get: function(roomId) {
            // Simple index lookup
            return rootRef.child("rooms/" + roomId).once('value');
        }
    }
	
})

.factory('Users', function($rootScope) {

    var allRoom = rootRef.child("users").once('value');

    return {
        allUser: function() {
            // get all room
            return allRoom;
        },
        getUser: function(roomId) {
            
            return rootRef.child("users/" + roomId).once('value');
        }
    }
	
})


.factory('fireBaseData', function($firebase) {
	var ref = new Firebase("https://foodcart-2dbdc.firebaseio.com/"),
	ref1 = new Firebase("https://foodcart-2dbdc.firebaseio.com/"),
	refCart = new Firebase("https://foodcart-2dbdc.firebaseio.com/cart"),
    refUser = new Firebase("https://foodcart-2dbdc.firebaseio.com/users"),
    refCategory = new Firebase("https://foodcart-2dbdc.firebaseio.com/category"),
	refContacts = new Firebase("https://foodcart-2dbdc.firebaseio.com/contacts"),
	refRooms = new Firebase("https://foodcart-2dbdc.firebaseio.com/rooms"),
    refOrder = new Firebase("https://foodcart-2dbdc.firebaseio.com/orders"),
    refFeatured = new Firebase("https://foodcart-2dbdc.firebaseio.com/featured"),
    refMenu = new Firebase("https://foodcart-2dbdc.firebaseio.com/menu"),
	amOnline = new Firebase('https://foodcart-2dbdc.firebaseio.com/.info/connected');
	
	
	
	return {
    ref: function() {
      return ref;
    },
	
	refCart: function() {
      return refCart;
    },
    refUser: function() {
      return refUser;
    },
    refCategory: function() {
      return refCategory;
    },
	refContacts: function() {
      return refContacts;
    },
    refOrder: function() {
      return refOrder;
    },
	refRooms: function() {
      return refRooms;
    },
	
    refFeatured: function() {
      return refFeatured;
    },
    refMenu: function() {
      return refMenu;
    }
  }
})


.factory('sharedUtils',['$ionicLoading','$ionicPopup', function($ionicLoading,$ionicPopup){


    var functionObj={};

    functionObj.showLoading=function(){
      $ionicLoading.show({
        content: '<i class=" ion-loading-c"></i> ', // The text to display in the loading indicator
        animation: 'fade-in', // The animation to use
        showBackdrop: true, // Will a dark overlay or backdrop cover the entire view
        maxWidth: 200, // The maximum width of the loading indicator. Text will be wrapped if longer than maxWidth
        showDelay: 0 // The delay in showing the indicator
      });
    };
    functionObj.hideLoading=function(){
      $ionicLoading.hide();
    };


    functionObj.showAlert = function(title,message) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: message
      });
    };

    return functionObj;

}])


.factory('sharedCartService', ['$ionicPopup','fireBaseData','$firebaseArray',function($ionicPopup, fireBaseData, $firebaseArray){

    var uid ;// uid is temporary user_id

    var cart={}; // the main Object


    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        uid=user.uid;
        cart.cart_items = $firebaseArray(fireBaseData.refCart().child(uid));
      }
    });




    //Add to Cart
    cart.add = function(item) {
      //check if item is already added or not
      fireBaseData.refCart().child(uid).once("value", function(snapshot) {

        if( snapshot.hasChild(item.$id) == true ){

          //if item is already in the cart
          var currentQty = snapshot.child(item.$id).val().item_qty;

          fireBaseData.refCart().child(uid).child(item.$id).update({   // update
            item_qty : currentQty+1
          });

        }else{

          //if item is new in the cart
          fireBaseData.refCart().child(uid).child(item.$id).set({    // set
            item_name: item.name,
            item_image: item.image,
            item_price: item.price,
            item_qty: 1
          });
        }
      });
    };

    cart.drop=function(item_id){
      fireBaseData.refCart().child(uid).child(item_id).remove();
    };

    cart.increment=function(item_id){

      //check if item is exist in the cart or not
      fireBaseData.refCart().child(uid).once("value", function(snapshot) {
        if( snapshot.hasChild(item_id) == true ){

          var currentQty = snapshot.child(item_id).val().item_qty;
          //check if currentQty+1 is less than available stock
          fireBaseData.refCart().child(uid).child(item_id).update({
            item_qty : currentQty+1
          });

        }else{
          //pop error
        }
      });

    };

    cart.decrement=function(item_id){

      //check if item is exist in the cart or not
      fireBaseData.refCart().child(uid).once("value", function(snapshot) {
        if( snapshot.hasChild(item_id) == true ){

          var currentQty = snapshot.child(item_id).val().item_qty;

          if( currentQty-1 <= 0){
            cart.drop(item_id);
          }else{
            fireBaseData.refCart().child(uid).child(item_id).update({
              item_qty : currentQty-1
            });
          }

        }else{
          //pop error
        }
      });

    };

    return cart;
  }])



.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}])


.factory('UserPresence', function() {
  var APIcarModels = {};
  APIcarModels.getAPIcarModels = function(user_id) {
   
		var amOnline = new Firebase('https://foodcart-2dbdc.firebaseio.com/.info/connected');
		var userLast = new Firebase('https://foodcart-2dbdc.firebaseio.com/users/'+ user_id+'/lastLogin/');
		var userRef = new Firebase('https://foodcart-2dbdc.firebaseio.com/presence/' + user_id);
		amOnline.on('value', function(snapshot) {
		  if (snapshot.val()) {
			userRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
			userRef.set('★ online');
			}
			});
			document.onIdle = function () {
			  userRef.set('☆ idle');
			}
			document.onAway = function () {
			  userRef.set('☄ away');
			}
			document.onBack = function (isIdle, isAway) {
			  userRef.set('★ online');
		}
   
    return 0;
	
	
  }
  return APIcarModels;

});






