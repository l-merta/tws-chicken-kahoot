const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 5200;

app.use(cors());
app.use(express.static("public"));

// Serve the main HTML file
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Create an HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store rooms and users
const rooms = new Map();

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Handle room creation with unique 5-digit room ID
  socket.on("createRoom", (roomId, callback) => {
    if (rooms.has(roomId)) {
      callback(false); // Room ID is taken
    } else {
      rooms.set(roomId, []);
      callback(true); // Room ID is available
    }
  });

  // Handle joining a room
  socket.on("joinRoom", (roomId) => {
    if (!rooms.has(roomId)) {
      socket.emit("error", "Room does not exist."); // Send error to the client
      return;
    }

    // Assign role based on the number of users in the room
    const users = rooms.get(roomId);
    const role = users.length === 0 ? "host" : "guest";

    // Add the new user to the room
    const user = { id: socket.id, name: `User ${socket.id}`, role };
    users.push(user);
    socket.join(roomId);

    // Emit updated user list and role assignment
    io.to(roomId).emit("roomUsers", users);
    socket.emit("roleAssigned", role);

    console.log(`User ${socket.id} joined room ${roomId} as ${role}`);
  });

  // Handle sending a message in the room
  socket.on("sendMessage", ({ roomId, message }) => {
    if (rooms.has(roomId)) {
      const user = rooms.get(roomId).find((u) => u.id === socket.id);
      if (user) {
        io.to(roomId).emit("receiveMessage", {
          sender: user.name,
          message,
        });
      }
    }
  });

  // Handle changing the user's name
  socket.on("changeName", ({ roomId, newName }) => {
    const users = rooms.get(roomId);
    const user = users.find((u) => u.id === socket.id);
    if (user) {
      user.name = newName; // Update user's name
      io.to(roomId).emit("roomUsers", users); // Update all users
    }
  });

  // Handle leaving the room
  socket.on("leaveRoom", (roomId) => {
    const users = rooms.get(roomId);
    if (!users) return;

    const userIndex = users.findIndex((user) => user.id === socket.id);
    const user = users[userIndex];

    if (user && user.role === "host") {
      // If the host leaves, send a message to all users only if there are others left
      if (users.length > 1) {
        io.to(roomId).emit("hostLeft", "The host has left the room.");
      }
    }

    // Remove the user from the room
    users.splice(userIndex, 1);
    rooms.set(roomId, users);

    socket.leave(roomId);
    io.to(roomId).emit("roomUsers", users);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);

    // Remove the user from any rooms they were part of
    rooms.forEach((users, roomId) => {
      const updatedUsers = users.filter((user) => user.id !== socket.id);
      rooms.set(roomId, updatedUsers);

      // If the room is now empty, remove it from the list
      if (updatedUsers.length === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit("roomUsers", updatedUsers);
      }
    });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
