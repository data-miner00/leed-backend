import firebase from "firebase";
import config from "./config";

export const db = firebase.initializeApp(config.firebaseConfig);
