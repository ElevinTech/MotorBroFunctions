const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
    return {"test": "data"};
});

// Listen for updates to the lastMessage of a chatroom
// Send FCM notification to its recipient
exports.userChatUser = functions.firestore.document('/chat-rooms/{chatRoomId}')
    .onUpdate((change, context) => {
       
        // Get an object representing the document
        // e.g. {'name': 'Marie', 'age': 66}
        const newValue = change.after.data();

        // ...or the previous value before this update
        const previousValue = change.before.data();

        // access a particular field as you would any JS property
        const chatMessage = newValue.lastMessage.message;
        const fcmTokenArray = newValue.lastMessage.recipientTokens;
        const shopId = newValue.participants.shop;
        const userId = newValue.participants.user;
        const chatRoomId = change.after.id;

        console.log("chatRoomId: " + chatRoomId)
        var payload = {
            data: {
                title: "New Chat Message",
                body: chatMessage,
                notificationType: "chat",
                chatRoom: chatRoomId,
                shop: shopId,
                user: userId
            }
        };
          

        admin.messaging().sendToDevice(fcmTokenArray, payload)
            .then((response) => {
                // Response is a message ID string.
                console.log('Message Sent', response);
                console.log(response.results[0].error);
                return "test";
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });


        return null;



    });

