// add.js
// This is the controller that handles the view to add or edit products.
// It first checks if user is authenticated, if not, the user is redirected to login screen.
// The selected productId to edit is stored on localStorage but is cleared after editing or when going back to the list of products.
// If there is a productId found on localStorage, it mean the user wants to update the product, else the user wants to add a new product.
'Use Strict';
angular.module('App').controller('addController', function($scope, $state, $localStorage, Popup, $cordovaCamera, Utils) {
  $scope.$on('$ionicView.enter', function() {
    //Check if user is authenticated, if not, redirect to Login Screen.
    if (!firebase.auth().currentUser) {
      $state.go('login');
    } else {
      if ($localStorage.productId) { //The user wants to update the product given the productId.
        Utils.show();
        //Fetch the product from the database, given the productId.
        firebase.database().ref('products/' + $localStorage.productId).once('value', function(product) {
          //Set product data from the database to the form.
          $scope.product = {
            name: product.val().name,
            price: product.val().price,
            currency: product.val().currency,
            imageUrl: product.val().imageUrl,
            description: product.val().description,
            url: product.val().url
          }
          $scope.imageUrl = $scope.product.imageUrl;
          //Set mode.
          $scope.isAdding = false;
          $scope.mode = "Save Product"
            //Apply scope.
          $scope.$apply();
          Utils.hide();
        });
      } else { //The user is adding a new product.
        //Clear and set default values for the form.
        $scope.product = {
          name: '',
          price: '',
          currency: '$ USD',
          description: '',
          url: ''
        }
        $scope.imageUrl = "img/placeholder.png";
        //Set mode.
        $scope.isAdding = true;
        $scope.mode = "Add Product"
      }
    }
  })

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
                imageUrl: $scope.product.imageUrl,
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
                    $state.go('home');
                  })
                  .catch(function() {
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
                imageUrl: $scope.product.imageUrl,
                description: $scope.product.description,
                url: $scope.product.url,
                lastUpdated: Date()
              }).then(function() { //Product edited successfully.
                //Clear productId because we're done updating it.
                $localStorage.productId = null;
                //Show success message then redirect to home.
                Utils.message(Popup.successIcon, Popup.productEditSuccess)
                  .then(function() {
                    $state.go('home');
                  })
                  .catch(function() {
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

  //Function to go back to home.
  $scope.back = function() {
    //Set productId to null, to reset it whether we're updating product or not.
    $localStorage.productId = null;
    //Go to home.
    $state.go('home');
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
  
  
  // Image picker code is end 
  
  
  
});
