const firebase = require("firebase");
const db = firebase.initializeApp({
  apiKey: "AIzaSyAylGozCdvYeBdLe12NkooDhW41MqkxorA",
  authDomain: "leed-caf7c.firebaseapp.com",
  projectId: "leed-caf7c",
  storageBucket: "leed-caf7c.appspot.com",
  messagingSenderId: "33634251985",
  appId: "1:33634251985:web:f4f082d06b5385cb6881f0",
});
const firestore = db.firestore();

const app = require("express")();
// app.use(cors());
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET, POST"],
  },
});

const users = [];

io.on("connection", (socket) => {
  socket.on("disconnect", () => console.log("A user disconnected"));

  socket.on("join-workspace", ({ groupId, name }) => {
    console.log("Joined");
    socket.join(groupId);
    users.push({ groupId, name, id: socket.id });
  });

  socket.on("leave-workspace", ({ groupId, name }) => {
    socket.leave(groupId);
    // users.find(u => )
  });

  socket.on("message", (message) => {
    const room = users.find((user) => user.id == socket.id).groupId;
    console.log(`${socket.id.substr(0, 2)} said ${message.message}`);
    io.to(room).emit("message", message);
    firestore
      .collection("groups")
      .doc(room)
      .collection("messages")
      .doc()
      .set({
        ...message,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
  });

  socket.on("code", (code) => {
    const room = users.find((user) => user.id == socket.id).groupId;
    socket.broadcast.to(room).emit("code", code);
  });
});

http.listen(5050, () => console.log("Listening on 5050"));
