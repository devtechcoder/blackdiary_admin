import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from "firebase/database";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const config = {
    apiKey: "AIzaSyAz3PprwaKTQW55OcKOgoW8v_8QqO3w6S8",
    authDomain: "tawasionline-412810.firebaseapp.com",
    databaseURL: "https://tawasionline-412810-default-rtdb.firebaseio.com",
    projectId: "tawasionline-412810",
    storageBucket: "tawasionline-412810.appspot.com",
    messagingSenderId: "629427547236",
    appId: "1:629427547236:web:34096274a86f03fec74371",
    measurementId: "G-Z64JKDD6FL"
};

const m_app = initializeApp(config);

const app = firebase.initializeApp(config);

const db = firebase.firestore();

const m_db = getFirestore(m_app);
const realDb = getDatabase(m_app);

export { db, firebase, realDb, m_db, m_app }