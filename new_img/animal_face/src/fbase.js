// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import App from "./App";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8Q-v7f_UIDB8_WoK8RU6SQamyO5D9z94",
  authDomain: "face-e4549.firebaseapp.com",
  projectId: "face-e4549",
  storageBucket: "face-e4549.appspot.com",
  messagingSenderId: "1056827673668",
  appId: "1:1056827673668:web:32b86d421655cdf1b48011"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;