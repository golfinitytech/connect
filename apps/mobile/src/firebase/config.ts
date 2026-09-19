import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCX1GrS9fLb1U4L7hPtcCP4OCvQVQtykSY",
  authDomain: "golfinity-1f5a1.firebaseapp.com",
  projectId: "golfinity-1f5a1",
  storageBucket: "golfinity-1f5a1.firebasestorage.app",
  messagingSenderId: "321649340938",
  appId: "1:321649340938:web:6cc10fb6c3a1406794e5f3",
  measurementId: "G-ZQ1YKC18SK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
