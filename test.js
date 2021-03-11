// const Hashes = require("jshashes");

// console.log(new Hashes.MD5().hex("D1onald"));
// console.log(new Hashes.MD5().hex("test123"));
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
  });

  socket.on("message", (message) => {
    const room = users.find((user) => user.id == socket.id).groupId;
    console.log(`${socket.id.substr(0, 2)} said ${message.message}`);
    io.to(room).emit("message", message);
  });

  socket.on("code", (code) => {
    const room = users.find((user) => user.id == socket.id).groupId;
    socket.broadcast.to(room).emit("code", code);
  });
});

http.listen(5050, () => console.log("Listening on 5050"));
