angular.module('starter.services', [])

.factory("Auth", ["$rootScope",
    function($rootScope) {
        return auth;
    }
])

.factory('Chats', ['$rootScope', 'Rooms', '$ionicPopup', function($rootScope, Rooms, $ionicPopup) {

    var selectedRoomId;

    var ref = mainApp;
    var chats;
    $rootScope.chatsGetRoom = [];

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

//console.log(selectedRoomId);
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
			//console.log(selectedRoomId);
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
            if (from && message) {
                var genKey = chats.push().key;
                rootRef.child('rooms').child(selectedRoomId).child('chats/' + genKey).set({
                    genKey: genKey,
                    from: from,
                    message: message,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });
            }
        }
    }
}])

/**
 * Simple Service which returns Rooms collection as Array from Salesforce & binds to the Scope in Controller
 */
.factory('Rooms', function($rootScope) {

     //Created data Rooms
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
             console.log(data);
         },function(err){
             console.log(err);
         });
     }*/
 //    End Created Data rooms

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
});