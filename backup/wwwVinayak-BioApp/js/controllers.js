angular.module('app.controllers', [])

.controller('loginCtrl', function($scope,$rootScope,$ionicHistory,sharedUtils,$state,$ionicSideMenuDelegate,UserPresence) {
    $rootScope.extras = false;  // For hiding the side bar and nav icon

    // When the user logs out and reaches login page,
    // we clear all the history and cache to prevent back link
    $scope.$on('$ionicView.enter', function(ev) {
      if(ev.targetScope !== $scope){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
      }
    });


    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
        $rootScope.extras = true;
        sharedUtils.hideLoading();
        $state.go('rooms', {}, {location: "replace"});

      }
    });


    $scope.loginEmail = function(formName,cred) {


      if(formName.$valid) {  // Check if the form data is valid or not

          sharedUtils.showLoading();

          //Email
          firebase.auth().signInWithEmailAndPassword(cred.email,cred.password).then(function(result) {

                // You dont need to save the users session as firebase handles it
                // You only need to :
                // 1. clear the login page history from the history stack so that you cant come back
                // 2. Set rootScope.extra;
                // 3. Turn off the loading
                // 4. Got to menu page

              $ionicHistory.nextViewOptions({
                historyRoot: true
              });
              $rootScope.extras = true;
              sharedUtils.hideLoading();
			  
			  
			firebase.auth().onAuthStateChanged(function(user) {
			if (user) 
			{
				$scope.user_info = user;
				
				UserPresence.getAPIcarModels($scope.user_info.uid);
				
			}});
		
			  
			  
              $state.go('menu2', {}, {location: "replace"});

            },
            function(error) {
              sharedUtils.hideLoading();
              sharedUtils.showAlert("Please note","Authentication Error");
            }
        );

      }else{
        sharedUtils.showAlert("Please note","Entered data is not valid");
      }



    };
	
	/*FCMPlugin.getToken(
	  function(token){
		alert(token);
	  },
	  function(err){
		console.log('error retrieving token: ' + err);
	  }
	)
*/

    $scope.loginFb = function(){
      //Facebook Login
	  
	  alert("Facebook");
	  //firebase.auth().signInWithPopup();
	  
	  
    };

    $scope.loginGmail = function(){
      //Gmail Login
    };


})

.controller('signupCtrl', function($scope,$rootScope,sharedUtils,$ionicSideMenuDelegate,
                                   $state,fireBaseData,$ionicHistory) {
    $rootScope.extras = false; // For hiding the side bar and nav icon

    $scope.signupEmail = function (formName, cred) {

      if (formName.$valid) {  // Check if the form data is valid or not

        sharedUtils.showLoading();

        //Main Firebase Authentication part
        firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).then(function (result) {

            //Add name and default dp to the Autherisation table
            result.updateProfile({
              displayName: cred.name,
              photoURL: "default_dp"
            }).then(function() {}, function(error) {});

            //Add phone number to the user table
            fireBaseData.refUser().child(result.uid).set({
              telephone: cred.phone,
			  displayname:cred.name,
			  profile_image:'default_dp'
			  
			});

            //Registered OK
            $ionicHistory.nextViewOptions({
              historyRoot: true
            });
            $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
            $rootScope.extras = true;
            sharedUtils.hideLoading();
            $state.go('menu2', {}, {location: "replace"});

        }, function (error) {
            sharedUtils.hideLoading();
            sharedUtils.showAlert("Please note","Sign up Error");
        });

      }else{
        sharedUtils.showAlert("Please note","Entered data is not valid");
      }

    }
	

  })

.controller('menu2Ctrl', function($scope,$rootScope,$ionicSideMenuDelegate,fireBaseData,$state,
                                  $ionicHistory,$firebaseArray,sharedCartService,sharedUtils) {

  //Check if user already logged in
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.user_info=user; //Saves data to user_info
    }else {

      $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
      $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      $rootScope.extras = false;
      sharedUtils.hideLoading();
      $state.go('tabsController.login', {}, {location: "replace"});

    }
  });

  // On Loggin in to menu page, the sideMenu drag state is set to true
  $ionicSideMenuDelegate.canDragContent(true);
  $rootScope.extras=true;

  // When user visits A-> B -> C -> A and clicks back, he will close the app instead of back linking
  $scope.$on('$ionicView.enter', function(ev) {
    if(ev.targetScope !== $scope){
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
    }
  });



  $scope.loadMenu = function() {
    sharedUtils.showLoading();
    $scope.menu=$firebaseArray(fireBaseData.refMenu());
    sharedUtils.hideLoading();
  }

  $scope.showProductInfo=function (id) {

  };
  $scope.addToCart=function(item){
    sharedCartService.add(item);
  };

})

.controller('offersCtrl', function($scope,$rootScope) {

    //We initialise it on all the Main Controllers because, $rootScope.extra has default value false
    // So if you happen to refresh the Offer page, you will get $rootScope.extra = false
    //We need $ionicSideMenuDelegate.canDragContent(true) only on the menu, ie after login page
    $rootScope.extras=true;
})

.controller('indexCtrl', function($scope,$rootScope,$ionicPopover,sharedUtils,$ionicHistory,$state,$ionicSideMenuDelegate,sharedCartService,UserPresence) {


	$ionicPopover.fromTemplateUrl('templates/popover.html', {
		scope: $scope,
	  }).then(function(popover) {
		$scope.popover = popover;
	  });


    $scope.popover_logout=function(){

      // Main Firebase logout
      firebase.auth().signOut().then(function() {
		$rootScope.extras = false;
		UserPresence.getAPIcarModels($scope.user_info.uid);
		//$ionicPopover.hide();
		$state.go('tabsController.login', {}, {location: "replace"});

      }, function(error) {
         //sharedUtils.showAlert("Error","Logout Failed")
      });

    }
	  
	  
	  

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.user_info=user; //Saves data to user_info

        //Only when the user is logged in, the cart qty is shown
        //Else it will show unwanted console error till we get the user object
        $scope.get_total= function() {
          var total_qty=0;
          for (var i = 0; i < sharedCartService.cart_items.length; i++) {
            total_qty += sharedCartService.cart_items[i].item_qty;
          }
          return total_qty;
        };

      }else {

        $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});

      }
    });

    $scope.logout=function(){

      sharedUtils.showLoading();

      // Main Firebase logout
      firebase.auth().signOut().then(function() {


        $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });


        $rootScope.extras = false;
		
		UserPresence.getAPIcarModels($scope.user_info.uid);
		
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});

      }, function(error) {
         sharedUtils.showAlert("Error","Logout Failed")
      });

    }
	
	
	
	
	
	

  })

.controller('myCartCtrl', function($scope,$rootScope,$state,sharedCartService) {

    $rootScope.extras=true;

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        $scope.cart=sharedCartService.cart_items;  // Loads users cart

        $scope.get_qty = function() {
          $scope.total_qty=0;
          $scope.total_amount=0;

          for (var i = 0; i < sharedCartService.cart_items.length; i++) {
            $scope.total_qty += sharedCartService.cart_items[i].item_qty;
            $scope.total_amount += (sharedCartService.cart_items[i].item_qty * sharedCartService.cart_items[i].item_price);
          }
          return $scope.total_qty;
        };
      }
      //We dont need the else part because indexCtrl takes care of it
    });

    $scope.removeFromCart=function(c_id){
      sharedCartService.drop(c_id);
    };

    $scope.inc=function(c_id){
      sharedCartService.increment(c_id);
    };

    $scope.dec=function(c_id){
      sharedCartService.decrement(c_id);
    };

    $scope.checkout=function(){
      $state.go('checkout', {}, {location: "replace"});
    };



})

.controller('lastOrdersCtrl', function($scope,$rootScope,fireBaseData,sharedUtils) {

    $rootScope.extras = true;
    sharedUtils.showLoading();

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $scope.user_info = user;

        fireBaseData.refOrder()
          .orderByChild('user_id')
          .startAt($scope.user_info.uid).endAt($scope.user_info.uid)
          .once('value', function (snapshot) {
            $scope.orders = snapshot.val();
            $scope.$apply();
          });
          sharedUtils.hideLoading();
      }
    });





})


.controller('userListCtrl', function($scope,$rootScope,$state,fireBaseData,sharedUtils,$firebaseArray,UserPresence,$ionicPopover) {

	

	$rootScope.extras = true;
	$scope.orders = [];

	var userlist=fireBaseData.refUser();
	
	firebase.auth().onAuthStateChanged(function(user) {
    if (user) 
	{
		$scope.user_info = user;
			
			UserPresence.getAPIcarModels($scope.user_info.uid);
				
			
			userlist.once("value", function(snapshot) {
			  snapshot.forEach(function(childSnapshot) {
				var key = childSnapshot.key();
				if(key!=$scope.user_info.uid)
				{
				
					var userRef = new Firebase('https://foodcart-2dbdc.firebaseio.com/presence/' + key);
					var childData = childSnapshot.val();
					userRef.on('value', function(snapshot) {
			  			$scope.$apply(function() {
						$scope.orders.push({
							id:snapshot.key(),
							user_status: snapshot.val(),
							name: childData.displayname ,
							mobile:childData.telephone ,
							profile_image:childData.profile_image,
							lastSeen:childData.lastLogin
						});
					  });
					});
				}
				
			  });
			});
		
	  
    }else {
	
	}
	
	
	});
	
	$scope.openChatRoom = function(userId) {
        $state.go('userChat', {
            userId: userId
        });
    }
	
	

})



.controller('groupCreateCtrl', function($scope,$rootScope,$state,fireBaseData,sharedUtils,$firebaseArray,UserPresence,$ionicPopover) {

	

	$rootScope.extras = true;
	$scope.grouplist = [];

	var userlist=fireBaseData.refUser();
	
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) 
		{
			$scope.user_info = user;
				UserPresence.getAPIcarModels($scope.user_info.uid);
				userlist.once("value", function(snapshot) {
				  snapshot.forEach(function(childSnapshot) {
					var key = childSnapshot.key();
					
					if(key!=$scope.user_info.uid)
					{
						var userRef = new Firebase('https://foodcart-2dbdc.firebaseio.com/presence/' + key);
						var childData = childSnapshot.val();
							userRef.on('value', function(snapshot) {
								$scope.$apply(function() {
								$scope.grouplist.push({
									user_status: snapshot.val(),
									id:snapshot.key(),
									name: childData.displayname ,
									mobile:childData.telephone ,
									profile_image:childData.profile_image,
									lastSeen:childData.lastLogin
								});
							  });
							});
					}
				  });
				});
		}
	});
	
	
	
		$scope.selected = [];
		var right='';
		$scope.checkedOrNot = function (id, isChecked, index) {
			if (isChecked) 
			{
				$scope.selected.push(id);
				
			} else {
				var _index = $scope.selected.indexOf(id);
				$scope.selected.splice(_index, 1);
			}
		};
		
		var rooms_num = new Firebase('https://foodcart-2dbdc.firebaseio.com/rooms/');
		var c;
		rooms_num.once("value", function(snapshot) {
		c = 1+snapshot.numChildren();
		
		});
		
		
		firebase.auth().onAuthStateChanged(function(user) {
			$scope.user_info = user;
		});
		
		$scope.done=function (groupme)
		{
			var newPostKey = rootRef.child('rooms').push().key;
				rootRef.child('rooms/' + c + '/').set({
					id: c,
					codeId: newPostKey,
					icon: 'ion-university',
					name: groupme
				}).then(function(data){
				},function(err){
				});
			
			var group = new Firebase('https://foodcart-2dbdc.firebaseio.com/rooms/'+ c +'/group_member/');
			for (var i = 0; i < $scope.selected.length; i++) {
				
				if($scope.selected[i]==$scope.user_info.uid)
					right='admin';
				else
					right='Participant';
				group.child($scope.selected[i]).set({
					role: right,
					createdAt:Firebase.ServerValue.TIMESTAMP,
				});
				
			}
			
			sharedUtils.showAlert("Your group is created.");
			
			
			 $state.go('rooms', {}, {location: "replace"});
			
			
		}
		
})



.controller('contactsCtrl', function($scope,$rootScope,$state,fireBaseData,sharedUtils,$firebaseArray,UserPresence,$ionicPopover,$ionicPopup) {


	$scope.addContact = function(edit_val) {  // Takes care of address add and edit ie Address Manipulator


      if(edit_val!=null) {
        $scope.data = edit_val; // For editing address
        var title="Edit Contact";
        var sub_title="Edit your contact";
      }
      else {
        $scope.data = {};    // For adding new address
        var title="Add Contact";
        var sub_title="Add your new contact";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text"   placeholder="Nick Name"  ng-model="data.name"> <br/> ' +
        '<input type="email" placeholder="Email" ng-model="data.email"> <br/> ' +
        '<input type="number" placeholder="Phone" ng-model="data.phone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          { text: 'Close' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data.name || !$scope.data.email || !$scope.data.phone ) {
                e.preventDefault(); //don't allow the user to close unless he enters full details
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function(res) {

        if(edit_val!=null) {
          //Update  address
          fireBaseData.refContacts().child($scope.user_info.uid).child("address").child(edit_val.$id).update({    // set
            name: res.name,
            email: res.email,
            phone: res.phone
          });
        }else{
          //Add new address
          fireBaseData.refContacts().child($scope.user_info.uid).push({    // set
            name: res.name,
            email: res.email,
            phone: res.phone
          });
        }

      });

    };

	
	$rootScope.extras = true;
	$scope.contactList = [];
	var userlist=fireBaseData.refUser();
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) 
		{
			$scope.user_info = user;
			UserPresence.getAPIcarModels($scope.user_info.uid);
			fireBaseData.refContacts().child($scope.user_info.uid).once("value", function(snapshot) {
				snapshot.forEach(function(childSnapshot) {
				var key = childSnapshot.key();
				var childData = childSnapshot.val();
					$scope.$apply(function() {
						$scope.contactList.push({
							name: childData.name,
							email:childData.email,
							phone:childData.phone
						});
					});
				});
			});
		}
	});
})

.controller('RoomsCtrl', ['$scope', '$rootScope', '$state', 'Rooms', 'Chats', function($scope,$rootScope,$state, Rooms, Chats ) {

    $rootScope.extras=true;
	
	
	$rootScope.datakuboss = [];
    $scope.get_promise_rooms = Rooms.all();
    $scope.get_promise_rooms.then(successGet);

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) 
		{
			$scope.user_info = user;
		}
	});
    function successGet(data) 
	{
		for (var i = 1; i < data.val().length; i++) 
		{
			var arr=data.val()[i].group_member;
						
			for (var key in arr) 
			{
				if($scope.user_info.uid==key)
				{
					$scope.$apply(function() 
					{
						$rootScope.datakuboss.push({
							id: data.val()[i].id,
							name: data.val()[i].name,
							icon: data.val()[i].icon
						});
					});
				}
						
			}
		}
    }

    $scope.openChatRoom = function(roomId) {
        $state.go('chat', {
            roomId: roomId
        });
    }
	
}])

.directive('fdInput', function(Chats) {
  return {
			  scope: {
				fileName: '='
			  },
			  link: function(scope, element, attrs) {
				element.on('change', function(evt) {
				  var files = evt.target.files;
				  //console.log(files[0].name);
				  //console.log(files[0].size);

				  var file = evt.target.files[0];
				    var metadata = {
						'contentType': file.type
					  };
					var auth = firebase.auth();
					var storageRef = firebase.storage().ref();
					
					storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
						//console.log('Uploaded', snapshot.totalBytes, 'bytes.');
						//console.log(snapshot.metadata);
						//alert("out side method");
						var url = snapshot.metadata.downloadURLs[0];
						
						//Chats.send(displayNames,  url );
						
						Chats.send(displayNames, '<img width="200px" src="' +  url + '">');
						//document.getElementById('linkbox').innerHTML = '<img width="200px" src="' +  url + '">';
						
					  
					  }).catch(function(error) {
					  
						console.error('Upload failed:', error);
					  
					  });
					  
				scope.fileName = files[0].name;
				scope.$apply();
				});
			  }
			}
})



.controller('ChatCtrl', ['$rootScope','$scope','$localStorage', 'Popup', '$cordovaCamera', 'Utils', 'Chats', '$state', function($rootScope, $scope, $localStorage, Popup, $cordovaCamera, Utils, Chats, $state) {
	
			
			$scope.fileName = '';

			$scope.IM = {
				textMessage: ""
			};
			
			displayNames = $scope.user_info.displayName;
			
			Chats.selectRoom($state.params.roomId);

			var roomName = Chats.getSelectedRoomName();

			// Fetching Chat Records only if a Room is Selected
			$scope.sendMessage = function(msg) {
				
				if (displayNames === "noname") {
					auth.signOut().then(function(data) {
						$state.go('login');
						// Sign-out successful.
					}, function(error) {
						// An error
					});
				} else {
					Chats.send(displayNames, msg);
					$scope.IM.textMessage = "";
				}

			}
			
			$scope.choosePhoto = function() {
				
				
			
				
				//Set Camera options here.
				//View https://github.com/apache/cordova-plugin-camera/blob/master/README.md#module_camera.CameraOptions for more information.
				var options = {
				  quality: 100,
				  destinationType: Camera.DestinationType.DATA_URL,
				  sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				  allowEdit: true,
				  encodingType: Camera.EncodingType.PNG,
				  targetWidth: 128,
				  targetHeight: 128,
				  popoverOptions: CameraPopoverOptions,
				  saveToPhotoAlbum: false
				};
				
				
				// Image picker code start 
				
				
				//Show loading modal.
				Utils.show();
				$cordovaCamera.getPicture(options).then(function(imageData) {
				  //Create imageURI.
				  //$scope.imgURI = "data:image/png;base64," + imageData;
				  //Create Blob File from ImageURI.
				  var file = $scope.dataURItoBlob("data:image/png;base64," + imageData);
				  //Create and set Meta Type to Firebase Storage Ref.
				  var storageRef = firebase.storage().ref();
				  var metadata = {
					  'contentType': file.type
					}
					//Refer to images folder of Firebase Storage.
				  storageRef.child('images/' + $scope.generateFilename()).put(file, metadata).then(function(snapshot) {
					//File successfully uploaded to Firebase Storage.
					var url = snapshot.metadata.downloadURLs[0];
					//Settings var to reflect the changes.
					//$scope.imageUrl = url;
					
					
					Chats.send(displayNames, "<img width='200px' src='"+url+"'>");
					
					
					$scope.$apply();
					//$scope.product.imageUrl = url;
					Utils.hide();
				  }).catch(function(error) {
					//Show Error.
					Utils.message(Popup.errorIcon, Popup.uploadImageError);
				  });
				}, function(err) {
				  //User Cancelled.
				  Utils.hide();
				});
			  }

			  //Function to generate random filename with length 100 for our imageFile's name to upload to Firebase.
			  $scope.generateFilename = function() {
				var text = "";
				var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
				for (var i = 0; i < 100; i++) {
				  text += possible.charAt(Math.floor(Math.random() * possible.length));
				}
				return text + ".png";
			  };
				
			  //Function to generate Blob File required by Firebase storage given the ImageURI.
			  $scope.dataURItoBlob = function(dataURI) {
				var binary = atob(dataURI.split(',')[1]);
				var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
				var array = [];
				for (var i = 0; i < binary.length; i++) {
				  array.push(binary.charCodeAt(i));
				}
				return new Blob([new Uint8Array(array)], {
				  type: mimeString
				});
			  };
			  
			  
			  // Image picker code is end 
			  
			  

			$scope.remove = function(chat) {
				Chats.remove(chat);
			}
	
	
}])


.controller('userChatCtrl', ['$rootScope','$scope', 'Chats', '$state', function($rootScope, $scope, Chats, $state) {
	
			$scope.fileName = '';

			$scope.IM = {
				textMessage: ""
			};
			
			displayNames = $scope.user_info.displayName;
			
			
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) 
				{
					$scope.user_info = user;
				}
			});
			
			Chats.selectUser($scope.user_info.uid,$state.params.userId);
			
			
			var roomName = Chats.getSelectedUserName($state.params.userId);
			$rootScope.userSelected=roomName;
			
			// Fetching Chat Records only if a Room is Selected
			$scope.sendMessage1 = function(msg) {
				
				if (displayNames === "noname") {
					auth.signOut().then(function(data) {
						$state.go('login');
						// Sign-out successful.
					}, function(error) {
						// An error
					});
				} else {
					Chats.sendUser(displayNames, msg);
					$scope.IM.textMessage = "";
					
					Chats.selectUser($scope.user_info.uid,$state.params.userId);
					
					var output = [], 
					  keys = [];

				  angular.forEach($rootScope.chatsGetUsers, function(item) {
					  var key = item['createdAt'];
					  if(keys.indexOf(key) === -1) {
						  keys.push(key);
						  output.push(item);
					  }
				  });
					
					$rootScope.chatsGetUsers=[];
					$rootScope.chatsGetUsers=output;
					
				}

			}

			$scope.remove = function(chat) {
				Chats.remove(chat);
			}
	
}])

.filter('unique', function() {
   return function(collection, keyname) 
   {
      var output = [], 
          keys = [];

      angular.forEach(collection, function(item) {
          var key = item[keyname];
          if(keys.indexOf(key) === -1) {
              keys.push(key);
              output.push(item);
          }
      });

      return output;
   };
})


.controller('favouriteCtrl', function($scope,$rootScope) {

    $rootScope.extras=true;
})

.controller('settingsCtrl', function($scope,$rootScope,fireBaseData,$firebaseObject,
                                     $ionicPopup,$state,$window,$firebaseArray, 
                                     sharedUtils,$localStorage, Popup, $cordovaCamera, Utils) {
    //Bugs are most prevailing here
    $rootScope.extras=true;

    //Shows loading bar
    sharedUtils.showLoading();

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        //Accessing an array of objects using firebaseObject, does not give you the $id , so use firebase array to get $id
        $scope.addresses= $firebaseArray(fireBaseData.refUser().child(user.uid).child("address"));

        // firebaseObject is good for accessing single objects for eg:- telephone. Don't use it for array of objects
        $scope.user_extras= $firebaseObject(fireBaseData.refUser().child(user.uid));

        $scope.user_info=user; //Saves data to user_info
		
		//displayNames=user_info.displayName;
        //NOTE: $scope.user_info is not writable ie you can't use it inside ng-model of <input>
		
		 $scope.image_url = "img/fk/"+ $scope.user_info.photoURL +".jpg";
		

        //You have to create a local variable for storing emails
        $scope.data_editable={};
        $scope.data_editable.email=$scope.user_info.email;  // For editing store it in local variable
        $scope.data_editable.password="";

        $scope.$apply();

        sharedUtils.hideLoading();

      }

    });

    $scope.addManipulation = function(edit_val) {  // Takes care of address add and edit ie Address Manipulator


      if(edit_val!=null) {
        $scope.data = edit_val; // For editing address
        var title="Edit Address";
        var sub_title="Edit your address";
      }
      else {
        $scope.data = {};    // For adding new address
        var title="Add Address";
        var sub_title="Add your new address";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text"   placeholder="Nick Name"  ng-model="data.nickname"> <br/> ' +
                  '<input type="text"   placeholder="Address" ng-model="data.address"> <br/> ' +
                  '<input type="number" placeholder="Pincode" ng-model="data.pin"> <br/> ' +
                  '<input type="number" placeholder="Phone" ng-model="data.phone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          { text: 'Close' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data.nickname || !$scope.data.address || !$scope.data.pin || !$scope.data.phone ) {
                e.preventDefault(); //don't allow the user to close unless he enters full details
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function(res) {

        if(edit_val!=null) {
          //Update  address
          if(res!=null){ // res ==null  => close 
            fireBaseData.refUser().child($scope.user_info.uid).child("address").child(edit_val.$id).update({    // set
              nickname: res.nickname,
              address: res.address,
              pin: res.pin,
              phone: res.phone
            });
          }
        }else{
          //Add new address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").push({    // set
            nickname: res.nickname,
            address: res.address,
            pin: res.pin,
            phone: res.phone
          });
        }

      });

    };

    // A confirm dialog for deleting address
    $scope.deleteAddress = function(del_id) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Address',
        template: 'Are you sure you want to delete this address',
        buttons: [
          { text: 'No' , type: 'button-stable' },
          { text: 'Yes', type: 'button-assertive' , onTap: function(){return del_id;} }
        ]
      });

      confirmPopup.then(function(res) {
        if(res) {
          fireBaseData.refUser().child($scope.user_info.uid).child("address").child(res).remove();
        }
      });
    };

    $scope.save= function (extras,editable) {
      //1. Edit Telephone doesnt show popup 2. Using extras and editable  // Bugs
      if(extras.telephone!="" && extras.telephone!=null ){
        //Update  Telephone
        fireBaseData.refUser().child($scope.user_info.uid).update({    // set
          telephone: extras.telephone
        });
      }

      //Edit Password
      if(editable.password!="" && editable.password!=null  ){
        //Update Password in UserAuthentication Table
        firebase.auth().currentUser.updatePassword(editable.password).then(function(ok) {}, function(error) {});
        sharedUtils.showAlert("Account","Password Updated");
      }

      //Edit Email
      if(editable.email!="" && editable.email!=null  && editable.email!=$scope.user_info.email){

        //Update Email/Username in UserAuthentication Table
        firebase.auth().currentUser.updateEmail(editable.email).then(function(ok) {
          $window.location.reload(true);
          //sharedUtils.showAlert("Account","Email Updated");
        }, function(error) {
          sharedUtils.showAlert("ERROR",error);
        });
      }

    };

    $scope.cancel=function(){
      // Simple Reload
      $window.location.reload(true);
      console.log("CANCEL");
    }
	
	
	// image update 
	
			$scope.profileImage=function()
			{
			 
				alert("IN");
				//Set Camera options here.
				//View https://github.com/apache/cordova-plugin-camera/blob/master/README.md#module_camera.CameraOptions for more information.
				var options = {
				  quality: 100,
				  destinationType: Camera.DestinationType.DATA_URL,
				  sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				  allowEdit: true,
				  encodingType: Camera.EncodingType.PNG,
				  targetWidth: 128,
				  targetHeight: 128,
				  popoverOptions: CameraPopoverOptions,
				  saveToPhotoAlbum: false
				};
				
				
				// Image picker code start 
				
				
				//Show loading modal.
				Utils.show();
				$cordovaCamera.getPicture(options).then(function(imageData) {
				  //Create imageURI.
				  $scope.imgURI = "data:image/png;base64," + imageData;
				  //Create Blob File from ImageURI.
				  var file = $scope.dataURItoBlob($scope.imgURI);
				  //Create and set Meta Type to Firebase Storage Ref.
				  var storageRef = firebase.storage().ref();
				  var metadata = {
					  'contentType': file.type
					}
					//Refer to images folder of Firebase Storage.
				  storageRef.child('images/' + $scope.generateFilename()).put(file, metadata).then(function(snapshot) {
					//File successfully uploaded to Firebase Storage.
					var url = snapshot.metadata.downloadURLs[0];
					//Settings var to reflect the changes.
					$scope.imageUrl = url;
					$scope.$apply();
					$scope.product.imageUrl = url;
					Utils.hide();
				  }).catch(function(error) {
					//Show Error.
					Utils.message(Popup.errorIcon, Popup.uploadImageError);
				  });
				}, function(err) {
				  //User Cancelled.
				  Utils.hide();
				});
			  }

			  //Function to generate random filename with length 100 for our imageFile's name to upload to Firebase.
			  $scope.generateFilename = function() {
				var text = "";
				var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
				for (var i = 0; i < 100; i++) {
				  text += possible.charAt(Math.floor(Math.random() * possible.length));
				}
				return text + ".png";
			  };
				
			  //Function to generate Blob File required by Firebase storage given the ImageURI.
			  $scope.dataURItoBlob = function(dataURI) {
				var binary = atob(dataURI.split(',')[1]);
				var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
				var array = [];
				for (var i = 0; i < binary.length; i++) {
				  array.push(binary.charCodeAt(i));
				}
				return new Blob([new Uint8Array(array)], {
				  type: mimeString
				});
			  };
			  
			  
	
	
	
	
	

})

.controller('supportCtrl', function($scope,$rootScope) {

    $rootScope.extras=true;

})

.controller('forgotPasswordCtrl', function($scope,$rootScope) {
    $rootScope.extras=false;
  })

.controller('checkoutCtrl', function($scope,$rootScope,sharedUtils,$state,$firebaseArray,
                                     $ionicHistory,fireBaseData, $ionicPopup,sharedCartService) {

    $rootScope.extras=true;

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.addresses= $firebaseArray( fireBaseData.refUser().child(user.uid).child("address") );
        $scope.user_info=user;
      }
    });

    $scope.payments = [
      {id: 'CREDIT', name: 'Credit Card'},
      {id: 'NETBANK', name: 'Net Banking'},
      {id: 'COD', name: 'COD'}
    ];

    $scope.pay=function(address,payment){

      if(address==null || payment==null){
        //Check if the checkboxes are selected ?
        sharedUtils.showAlert("Error","Please choose from the Address and Payment Modes.")
      }
      else {
        // Loop throw all the cart item
        for (var i = 0; i < sharedCartService.cart_items.length; i++) {
          //Add cart item to order table
          fireBaseData.refOrder().push({

            //Product data is hardcoded for simplicity
            product_name: sharedCartService.cart_items[i].item_name,
            product_price: sharedCartService.cart_items[i].item_price,
            product_image: sharedCartService.cart_items[i].item_image,
            product_id: sharedCartService.cart_items[i].$id,

            //item data
            item_qty: sharedCartService.cart_items[i].item_qty,

            //Order data
            user_id: $scope.user_info.uid,
            user_name:$scope.user_info.displayName,
            address_id: address,
            payment_id: payment,
            status: "Queued"
          });

        }

        //Remove users cart
        fireBaseData.refCart().child($scope.user_info.uid).remove();

        sharedUtils.showAlert("Info", "Order Successfull");

        // Go to past order page
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $state.go('lastOrders', {}, {location: "replace", reload: true});
      }
    }



    $scope.addManipulation = function(edit_val) {  // Takes care of address add and edit ie Address Manipulator


      if(edit_val!=null) {
        $scope.data = edit_val; // For editing address
        var title="Edit Address";
        var sub_title="Edit your address";
      }
      else {
        $scope.data = {};    // For adding new address
        var title="Add Address";
        var sub_title="Add your new address";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text"   placeholder="Nick Name"  ng-model="data.nickname"> <br/> ' +
        '<input type="text"   placeholder="Address" ng-model="data.address"> <br/> ' +
        '<input type="number" placeholder="Pincode" ng-model="data.pin"> <br/> ' +
        '<input type="number" placeholder="Phone" ng-model="data.phone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          { text: 'Close' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data.nickname || !$scope.data.address || !$scope.data.pin || !$scope.data.phone ) {
                e.preventDefault(); //don't allow the user to close unless he enters full details
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function(res) {

        if(edit_val!=null) {
          //Update  address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").child(edit_val.$id).update({    // set
            nickname: res.nickname,
            address: res.address,
            pin: res.pin,
            phone: res.phone
          });
        }else{
          //Add new address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").push({    // set
            nickname: res.nickname,
            address: res.address,
            pin: res.pin,
            phone: res.phone
          });
        }

      });

    };


  })

