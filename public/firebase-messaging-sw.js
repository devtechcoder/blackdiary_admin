importScripts('https://www.gstatic.com/firebasejs/9.20.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.20.0/firebase-messaging-compat.js');

const init = () => {

  // const firebaseConfig = {
  //   apiKey: "AIzaSyBE-ouDIonU23JZFPq-XNXYj94y69Ygc7k",
  //   authDomain: "pimptup-f722b.firebaseapp.com",
  //   databaseURL: "https://pimptup-f722b-default-rtdb.firebaseio.com",
  //   projectId: "pimptup-f722b",
  //   storageBucket: "pimptup-f722b.appspot.com",
  //   messagingSenderId: "915352896435",
  //   appId: "1:915352896435:web:540b15925d5d5de84dc1c6",
  //   measurementId: "G-YWEQMVW1WF"
  // } 

  const firebaseConfig = {
    apiKey: "AIzaSyAz3PprwaKTQW55OcKOgoW8v_8QqO3w6S8",
    authDomain: "tawasionline-412810.firebaseapp.com",
     databaseURL: "https://tawasionline-412810-default-rtdb.firebaseio.com",
    projectId: "tawasionline-412810",
    storageBucket: "tawasionline-412810.appspot.com",
    messagingSenderId: "629427547236",
    appId: "1:629427547236:web:34096274a86f03fec74371",
    measurementId: "G-Z64JKDD6FL"
  };

  firebase.initializeApp(firebaseConfig);

  const isSupported = firebase.messaging.isSupported()

  if (!isSupported) return

  const messaging = firebase.messaging();


  self.addEventListener('notificationclick', function (event) {
    console.log('Notification clicked');

    event.notification.close();

    // event.waitUntil(
    //   self.clients.openWindow('/my-account?path=message') // Redirect to the URL set in click_action property
    // );
  });

  // self.addEventListener('push', (event) => {
  //   // Handle push notification event
  //   console.log("Push Notification");
  // });

  // Handle incoming messages while the app is not in focus (i.e in the background, hidden behind other tabs, or completely closed).
  messaging.onBackgroundMessage(function (payload) {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      // click_action: '/my-account?path=message'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });


}

init()