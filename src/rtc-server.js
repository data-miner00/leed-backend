const firebase = require("firebase");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
dotenv.config();

const db = firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
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
    console.log(`${name} joined ${groupId}`);
    socket.join(groupId);

    users.push({ groupId, name, id: socket.id });
    console.log(users);
  });

  socket.on("leave-workspace", ({ groupId, name }) => {
    console.log(`${name} left ${groupId}`);
    socket.leave(groupId);

    const userIndex = users.map((u) => u.name).indexOf(name);
    users.splice(userIndex, 1);
    console.log(users);
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

  socket.on("save", ({ code, groupId }) => {
    console.log("called");
    fs.writeFile(
      path.join("uploads", "code", groupId + ".file"),
      code,
      (err, data) => {
        if (err) console.error(err);
        else console.log(data);
      }
    );
  });
});

http.listen(process.env.RTC_PORT, () => console.log(`Listening on 5050`));
