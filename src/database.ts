import firebase from "firebase";
import config from "./config";

export const db = firebase.initializeApp(config.firebaseConfig);

export const Timestamp = firebase.firestore.Timestamp;

export const FieldPath = firebase.firestore.FieldPath;
