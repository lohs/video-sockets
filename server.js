const port = process.env.PORT || 5001;
const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const cors = require("cors");
app.use(cors());

app.get("/", (req, res) => {
  res.send("video webRTC socket server running");
});

// CREATE SOCKET CONNECTION
io.on("connection", (socket) => {
  // SEND SOCKET ID TO CLIENT
  socket.emit("self", socket.id);

  // CLIENT DISCONNECTED
  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  // GET DATA FROM CALLER
  socket.on("callUser", (data) => {
    // SEND TO CALLEE
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  // GET DATA FROM CALLEE
  socket.on("answerCall", (data) => {
    // SEND DATA TO CALLER
    io.to(data.to).emit("callAccepted", data);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
