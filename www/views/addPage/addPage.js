// home.js
// This is the controller that handles the main view when the user is successfully logged in.
// The account currently logged in can be accessed through localStorage.account.
// The authenticated user can be accessed through firebase.auth().currentUser.
'Use Strict';
angular.module('App').controller('addController', function($scope, $state, $localStorage, Utils, Popup, $timeout, Service, $ionicTabsDelegate, $ionicHistory, Watchers,$cordovaCamera,$cordovaLocalNotification, $ionicPlatform) {
														   
	
	$scope.product = {
          name: '',
          price: '',
          currency: '$ USD',
          description: '',
          url: ''
        }
        $scope.imageUrl1 = "img/placeholder.png";
        //Set mode.
        $scope.isAdding = true;
        $scope.mode = "Add Product";
		
	
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
	 
  });
  
  
    
  //Allow changing to other views when tabs is selected.
  $scope.changeTab = function(stateTo) {
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
    $ionicTabsDelegate.select(3);
	$scope.product = {
          name: '',
          price: '',
          currency: '$ USD',
          description: '',
          url: ''
        }
        $scope.imageUrl1 = "img/placeholder.png";
        //Set mode.
        $scope.isAdding = true;
        $scope.mode = "Add Product";
  });
  
   //Function to go back to home.
  $scope.back = function() {
	$scope.canChangeView = true;
    //Set productId to null, to reset it whether we're updating product or not.
    $localStorage.productId = null;
    //Go to home.
    $state.go('home');
  };
  
  
   $scope.add = function(product) {
    if (angular.isDefined($scope.product)) { //Check if productForm is filled up.
      Utils.show();
      var userId = firebase.auth().currentUser.uid;
      //Fetch the account, since the account contains the list of products the account has added.
      firebase.database().ref('accounts').orderByChild('userId').equalTo(userId).once('value').then(function(accounts) {
        if (accounts.exists()) {
          accounts.forEach(function(account) {
            if ($scope.isAdding) { //User is adding a new product.
              //Add Product to Database. Firebase v3 Implementation.
              firebase.database().ref().child('products').push({
                name: $scope.product.name,
                price: $scope.product.price,
                currency: $scope.product.currency,
                imageUrl: $scope.product.imageUrl1,
                description: $scope.product.description,
                url: $scope.product.url,
                dateCreated: Date()
              }).then(function(response) {
                //Product added successfully.
                var productId = response.key;
                //Add Product to Account's Product List.
                var products = account.val().products;
                if (!products) {
                  products = [];
                }
                products.push(productId);
                //Update Account's product list.
                firebase.database().ref('accounts/' + account.key).update({
                  products: products
                });
                //Show success message then redirect to home.
                Utils.message(Popup.successIcon, Popup.productAddSuccess)
                  .then(function() {
								 $scope.canChangeView = true;
                    $state.go('home');
                  })
                  .catch(function() {
								  $scope.canChangeView = true;
                    //User closed the prompt, redirect immediately.
                    $state.go('home');
                  });
              });
            } else { //User is updating a product.
              //Fetch the product to be updated, given the productId.
              firebase.database().ref().child('products/' + $localStorage.productId).update({
                name: $scope.product.name,
                price: $scope.product.price,
                currency: $scope.product.currency,
                imageUrl: $scope.product.imageUrl1,
                description: $scope.product.description,
                url: $scope.product.url,
                lastUpdated: Date()
              }).then(function() { //Product edited successfully.
                //Clear productId because we're done updating it.
                $localStorage.productId = null;
                //Show success message then redirect to home.
                Utils.message(Popup.successIcon, Popup.productEditSuccess)
                  .then(function() {
					$scope.canChangeView = true;
                    $state.go('home');
						
                  })
                  .catch(function() {
								  $scope.canChangeView = true;
                    //User closed the prompt, redirect immediately.
                    $state.go('home');
                  });
              });
            }
          });
        }
      });
    }
  };
  
    //Function to open photo library of user to select photo to upload to Firebase Storage.
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
        $scope.imageUrl1 = url;
        $scope.$apply();
        $scope.product.imageUrl1 = url;
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
  
  // Local Notification code 
  /*
	$scope.clickon = function () {
  
		$scope.counter = 0;
		$scope.onTimeout = function(){
			$scope.counter++;
			mytimeout = $timeout($scope.onTimeout,1000);
		}
		var mytimeout = $timeout($scope.onTimeout,1000);
		
		$scope.stop = function(){
			$timeout.cancel(mytimeout);
		}

	};
	
	$scope.updateNotificationEvery = function () {
		$scope.counter = 0;
		$scope.onTimeout = function(){
			$scope.counter++;
			mytimeout = $timeout($scope.onTimeout,1000);
		}
		var mytimeout = $timeout($scope.onTimeout,1000);

		$cordovaLocalNotification.schedule({
		id: 3,
		title: 'Every Minute',
		text: ""+$scope.counter,
		every: 'second'
		}).then(function (result) {
		console.log('Every Minute Notification Set');
		});
		
		$cordovaLocalNotification.isPresent(3).then(function (present) {
			if (present) {
				$cordovaLocalNotification.update({
					id: 3,
					title: 'Notification  Update',
					text: ""+$scope.counter,
					every: 'second'

				}).then(function (result) {
					console.log('Updated Notification Every');
				});
			} else {
				alert("Must Schedule Every Minute First");
			}
		});
	};
	
	$scope.cancelNotification = function () {
		$cordovaLocalNotification.isPresent(3).then(function (present) {
			if (present) {
				$cordovaLocalNotification.cancel(3).then(function (result) {
					console.log('Notification EveryMinute Cancelled');
					alert('Cancelled Every Minute');
				});
			} else {
				alert("Must Schedule Every Minute First");
			}
		});
	};
	*/
    
	

});
