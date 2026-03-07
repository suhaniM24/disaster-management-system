// firebase-config.js
// Firebase Compat SDK (works without a local server / ES modules)
// Replace with your actual Firebase project credentials

const firebaseConfig = {
  apiKey: "AIzaSyBfQy-L6QRlobcGDPpJJ94P7fM3v_Fb-wg",
  authDomain: "disasterguard-15d4c.firebaseapp.com",
  projectId: "disasterguard-15d4c",
  storageBucket: "disasterguard-15d4c.firebasestorage.app",
  messagingSenderId: "82727365517",
  appId: "1:82727365517:web:99ed1d2c69bae03c38abc4",
  measurementId: "G-NWK7LHTPX0"
};

// Initialize Firebase (compat mode – global firebase object)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
