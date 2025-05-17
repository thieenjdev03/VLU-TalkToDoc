// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDQhDcQIrL-abmVcmDwSWqIIiQnSiQprOI',
  authDomain: 'talktodoc-6c9b0.firebaseapp.com',
  databaseURL:
    'https://talktodoc-6c9b0-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'talktodoc-6c9b0',
  storageBucket: 'talktodoc-6c9b0.firebasestorage.app',
  messagingSenderId: '399631715856',
  appId: '1:399631715856:web:d444ad4f2bfbc52e894495'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
