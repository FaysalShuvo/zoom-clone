const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// uuid to give us unique id
const { v4: uuid } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/peerjs", peerServer);
app.get("/", (req, res) => {
  // creating new id for rooms
  res.redirect(`${uuid()}`);
});

app.get("/:room", (req, res) => {
  // rendering the frontend part
  res.render("room", { roomId: req.params.room });
});

// user connection && joining room
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);

    // sending message to specific room
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});

server.listen(process.env.PORT || 4030);
