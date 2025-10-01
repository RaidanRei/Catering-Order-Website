// ==== Firebase Configuration ====
// Replace these values with your actual Firebase project configuration
// You can find this in Firebase Console → Project Settings → General → Your Apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Example: "AIzaSyDxxx..."
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// ==== Initialize Firebase ====
firebase.initializeApp(firebaseConfig);

// Firestore Database
const db = firebase.firestore();

// Firebase Authentication
const auth = firebase.auth();

// Firebase Storage (for image uploads in user.js)
const storage = firebase.storage();
