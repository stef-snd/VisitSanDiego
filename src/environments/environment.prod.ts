export const environment = {
  firebase: {
    // add your Firebase config here
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "firebase/app";
    import { getAnalytics } from "firebase/analytics";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
      apiKey: "AIzaSyBWXQAV40BkugERzO9czKypcesgD2yFh30",
      authDomain: "isilab5-80412.firebaseapp.com",
      projectId: "isilab5-80412",
      storageBucket: "isilab5-80412.appspot.com",
      messagingSenderId: "495542578504",
      appId: "1:495542578504:web:95605b7b31c9ead450977d",
      measurementId: "G-6XLHZGCGRE"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
  },
  production: true
};
