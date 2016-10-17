// home.js
// This is the controller that handles the main view when the user is successfully logged in.
// This view shows the list of products the logged-in users have.
// To edit a product, just tap on the product.
// To delete a product tap on the 'x' button on the upper right corner of the product.
'Use Strict';
angular.module('App').controller('homeController', function($scope, $state, $localStorage, Utils, Popup, $timeout, Service, $ionicTabsDelegate, $ionicHistory, Watchers, $ionicPopup) {
  
   $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
  });

  $scope.$on('$ionicView.enter', function() {
    
	
    //Check if user is authenticated, if not, redirect to Login Screen.
	if (!firebase.auth().currentUser) {
      $state.go('login');
    } else {
      Utils.show();
      //Get user's productList from Firebase.
      $scope.products = [];
      var userId = firebase.auth().currentUser.uid;
      firebase.database().ref('accounts').orderByChild('userId').equalTo(userId).once('value').then(function(accounts) {
        if (accounts.exists()) {
          accounts.forEach(function(account) {
            $scope.accountId = account.key;
            $scope.productIds = account.val().products;
            if (!$scope.productIds) {
              //User has no products yet!
              Utils.hide();
            }
            //Fetch each products the user have given the productIds
            $scope.productIds.forEach(function(productId) {
              //Get the product.
              firebase.database().ref('products/' + productId).once('value', function(product) {
                var price;
                //Create price string.
                if (product.val().price == 0) {
                  price = "FREE";
                } else {
                  price = product.val().currency[0] + product.val().price;
                }
                //Create product object to be added to the productList.
                var product = {
                  id: productId,
                  name: product.val().name,
                  price: price,
                  imageUrl: product.val().imageUrl,
                  description: product.val().description,
                  url: product.val().url
                };
                //Add product to productList.
                $scope.products.push(product);
                $scope.$apply();
                Utils.hide();
              });
            });
          });
        }
      });
    }
	$scope.canChangeView = false;
	$ionicTabsDelegate.select(5);
  })
  
   
  //Allow changing to other views when tabs is selected.
  $scope.changeTab = function(stateTo) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $scope.canChangeView = true;
    $state.go(stateTo);
  };

  //Adding product, go to add Screen.
  $scope.add = function() {
	$scope.canChangeView = true;
    $state.go('addPage');
  };

  //Editting product, set productId to edit, then go to add Screen.
  $scope.edit = function(id) {
    $localStorage.productId = id;
    
	$state.go('addPage');
  }

  //Deleting product.
  $scope.delete = function(id) {
    //Show confirmation popup.
    var popup = Utils.confirm('ion-trash-b', 'Are you sure you want to delete this product?');
    popup.then(function(isDelete) {
      if (isDelete) { //Confirm delete.
        var indexToRemove = $scope.productIds.indexOf(id);
        //Remove productId from productIds list of the account.
        $scope.productIds.splice(indexToRemove, 1);
        //Remove product from productsList.
        $scope.products.splice(indexToRemove, 1);
        //Update changes on Firebase, delete product and set the new productId list of the account.
        firebase.database().ref('products/' + id).remove();
        firebase.database().ref('accounts/' + $scope.accountId).update({
          products: $scope.productIds
        });
      }
    });
  }

  //View product url.
  $scope.info = function(url) {
    window.open(url, '_system', 'location=no');
  }

  //Logout.
  $scope.logout = function() {
    $localStorage.$reset();
    $state.go('login');
  }

});
