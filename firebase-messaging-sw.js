importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB0BBzQzGX6MHVSjn09VSD-JGpSwOu8EqQ",
  authDomain: "bixmax-6c24c.firebaseapp.com",
  projectId: "bixmax-6c24c",
  storageBucket: "bixmax-6c24c.appspot.com",
  messagingSenderId: "37740442541",
  appId: "1:37740442541:web:a2e2b9bb81c6a8e76c6724"
});

const messaging = firebase.messaging();