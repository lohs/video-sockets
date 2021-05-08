const port = process.env.PORT || 5000;
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

io.on("connection", (socket) => {
  socket.emit("self", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    console.log("Calling user!");
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    console.log("Accepting call!");
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
