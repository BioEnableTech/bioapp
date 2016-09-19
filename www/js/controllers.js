angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})


.controller('LoginCtrl', ['$scope', '$rootScope', '$ionicModal', '$ionicLoading', '$state', function($scope, $rootScope, $ionicModal, $ionicLoading, $state) {

    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.createUser = function(user) {
        if (user && user.email && user.password && user.displayname) {
            $ionicLoading.show({
                template: 'Signing Up...'
            });


            auth.createUserWithEmailAndPassword(user.email, user.password).then(function(userData) {
                alert("User created successfully!");
                rootRef.child("users").child(userData.uid).set({
                    email: user.email,
                    displayName: user.displayname
                });
                $ionicLoading.hide();
                $scope.modal.hide();
            }, function(error) {
                alert("Error: " + error);
                $ionicLoading.hide();
            });
        } else
            alert("Please fill all details");
    }

    $scope.signIn = function(user) {

        if (user && user.email && user.pwdForLogin) {
            $ionicLoading.show({
                template: 'Signing In...'
            });
            auth.signInWithEmailAndPassword(user.email, user.pwdForLogin).then(function(authData) {
                rootRef.child("users").child(authData.uid).on('value', function(snapshot) {
                    // To Update AngularJS $scope either use $apply or $timeout
                    displayNames = snapshot.val().displayName;
                });
                $ionicLoading.hide();
                $state.go('app.rooms');
            }, function(error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    }
}])

.controller('ChatCtrl', ['$rootScope', '$scope', 'Chats', '$state', function($rootScope, $scope, Chats, $state) {

    $scope.IM = {
        textMessage: ""
    };

    Chats.selectRoom($state.params.roomId);

	selectedRoomId=$state.params.roomId;
    var roomName = Chats.getSelectedRoomName();

//alert(selectedRoomId);

    // Fetching Chat Records only if a Room is Selected
    $scope.sendMessage = function(msg) {
		//alert(displayNames);
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

    $scope.remove = function(chat) {
        Chats.remove(chat);
    }
}])

.controller('RoomsCtrl', ['$scope', '$rootScope', '$state', 'Rooms', 'Chats', function($scope, $rootScope, $state, Rooms, Chats) {

    $rootScope.datakuboss = [];
    $scope.get_promise_rooms = Rooms.all();
    $scope.get_promise_rooms.then(successGet);

    function successGet(data) {
        for (var i = 1; i < data.val().length; i++) {
            $scope.$apply(function() {
                $rootScope.datakuboss.push({
                    id: data.val()[i].id,
                    name: data.val()[i].name,
                    icon: data.val()[i].icon
                });
            });

        }
    }

    $scope.openChatRoom = function(roomId) {
		 $state.go('app.chat', {
            roomId: roomId
        });
    }
}])

.controller('SignoutCtrl', function($scope, $ionicLoading, $state, $ionicPlatform, $ionicPopup) {
    $scope.logoutNow = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Logout',
            template: 'Are you sure you want to logout?'
        });

        confirmPopup.then(function(res) {
            if (res) {
                auth.signOut().then(function(data) {
                    $state.go('login');
                    // Sign-out successful.
                }, function(error) {});
            } else {}
        });
    }
});