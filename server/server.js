const express = require("express");
const cors = require("cors");
const http = require("http"); // Required for creating the server with Socket.IO
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 5200;

// Use CORS middleware
app.use(cors());

// Serve static files from the React app
app.use(express.static("public"));

// API route that returns a JSON object
app.get("/api", (req, res) => {
  res.json({ api: "Hello World" });
});

// Serve the main HTML file for all other routes
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Create an HTTP server and pass it to Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins, adjust as needed for production security
  },
});

// Socket.IO setup
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle joining a room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("userJoined", socket.id);
  });

  // Handle sending messages to a room
  socket.on("sendMessage", ({ roomId, message }) => {
    console.log(socket.id + " says " + message);
    io.to(roomId).emit("receiveMessage", {
      sender: socket.id,
      message,
    });
  });

  // Handle disconnecting from the server
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});