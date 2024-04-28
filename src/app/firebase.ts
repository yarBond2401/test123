// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyD524tP59AM7saqTbA33HvU4IU98bdxy90',
  authDomain: 'mkr-it.firebaseapp.com',
  projectId: 'mkr-it',
  storageBucket: 'mkr-it.appspot.com',
  messagingSenderId: '108195655767',
  appId: '1:108195655767:web:0caa8933030983a574b312',
  measurementId: 'G-XS50827T8C',
  reCaptchaPublicKey: '6Lcxan8pAAAAALENRmYXQ_v_XaOTZiSsDnkkXSEE',
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
// const analytics = getAnalytics(app);

export { firebaseConfig, app, auth, db, storage, functions };
