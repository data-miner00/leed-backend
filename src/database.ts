import firebase from "firebase";
import config from "./config";

export const db = firebase.initializeApp(config.firebaseConfig);

export const Timestamp = firebase.firestore.Timestamp;

export const FieldPath = firebase.firestore.FieldPath;

export const FieldValue = firebase.firestore.FieldValue;

export const Increment = firebase.firestore.FieldValue.increment(1);

export const Decrement = firebase.firestore.FieldValue.increment(-1);
