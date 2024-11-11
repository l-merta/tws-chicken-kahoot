const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 5200;

// Load questions from the JSON file
const questions = JSON.parse(fs.readFileSync(path.join(__dirname, 'json/questions/chicken.json'), 'utf-8'));

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
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("error", { code: 101, message: "Místnost s tímto kódem neexistuje" }); // Send error to the client
      return;
    }
    if (room.gameStarted) {
      socket.emit("error", { code: 102, message: "Hra již začala" }); // Send error if the game is in progress
      return;
    }
  
    // Generate a unique 4-digit username
    let newUserNumber = 1;
    let newUserName = `player${newUserNumber.toString().padStart(2, '0')}`;
  
    while (room.some(user => user.name === newUserName)) {
      newUserNumber++;
      newUserName = `player${newUserNumber.toString().padStart(2, '0')}`;
    }
  
    // Assign role based on the number of users in the room
    const role = room.length === 0 ? "host" : "guest";
  
    // Add the new user to the room
    const user = { id: socket.id, name: newUserName, role };
    room.push(user);
    socket.join(roomId);
  
    // Emit updated user list and role assignment
    io.to(roomId).emit("roomUsers", room);
    socket.emit("roleAssigned", role);
  
    console.log(`User ${socket.id} joined room ${roomId} as ${role} with name ${newUserName}`);
  });

  // Handle starting the game
  socket.on("startGame", (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      const user = room.find((u) => u.id === socket.id);
      if (user && user.role === "host") {
        room.gameStarted = true;
        room.currentQuestionIndex = 0;
        room.totalQuestions = 3; // Set number of questions for the game
        room.timeForQuestion = 2; // Set time for each question
  
        // Shuffle questions randomly before starting the game
        const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
  
        io.to(roomId).emit("gameState", { gameStarted: true });
        console.log(`Game started in room ${roomId}`);
  
        // Helper function to send the next question
        const sendQuestion = () => {
          if (room.currentQuestionIndex < room.totalQuestions && room.currentQuestionIndex < shuffledQuestions.length) {
            const question = shuffledQuestions[room.currentQuestionIndex];
  
            // Shuffle the answers for each question
            const answers = question.answers.slice();
            const correctAnswer = answers[question.correct];
            const scrambledAnswers = answers.sort(() => Math.random() - 0.5);
            const newCorrectIndex = scrambledAnswers.indexOf(correctAnswer);
  
            const questionToSend = {
              question: question.question,
              answers: scrambledAnswers,
              time: room.timeForQuestion
            };
  
            io.to(roomId).emit("question", questionToSend);
            console.log(`Question ${room.currentQuestionIndex + 1} sent to room ${roomId}`);
            console.log(`Correct answer is: "${correctAnswer}" at position ${newCorrectIndex + 1} in scrambled answers`);
  
            // Wait for the time specified, then emit the question result
            setTimeout(() => {
              io.to(roomId).emit("questionResult", {
                message: "Time's up! Here is the correct answer.",
                correctAnswer: correctAnswer,
                correctIndex: newCorrectIndex + 1 // Send 1-based index for display
              });
              console.log(`Result for question ${room.currentQuestionIndex + 1} emitted to room ${roomId}`);
              console.log(`The correct answer was "${correctAnswer}" at position ${newCorrectIndex + 1}`);
  
              room.currentQuestionIndex++;
              if (room.currentQuestionIndex < room.totalQuestions && room.currentQuestionIndex < shuffledQuestions.length) {
                // Send the next question after a short delay (e.g., 3 seconds)
                setTimeout(sendQuestion, 3000);
              } else {
                // Delay before sending the gameEnd message
                setTimeout(() => {
                  io.to(roomId).emit("gameEnd", { message: "The game has ended! Thank you for playing." });
                  console.log(`Game ended in room ${roomId}`);
                }, 3000); // Add delay before game end
              }
            }, questionToSend.time * 1000);
  
          } else {
            // Safety check if the game exceeds the available number of questions
            io.to(roomId).emit("gameEnd", { message: "The game has ended! Thank you for playing." });
            console.log(`Game ended in room ${roomId}`);
          }
        };
  
        // Start the game by sending the first question
        sendQuestion();
      }
    }
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
        if(!users.gameStarted)
          io.to(roomId).emit("error", { code: 103, message: "Zakladatel místnosti odešel" });
      }
    }

    // Remove the user from the room
    users.splice(userIndex, 1);
    rooms.set(roomId, users);

    socket.leave(roomId);
    io.to(roomId).emit("roomUsers", users);
    console.log(`User ${socket.id} left room ${roomId}`);
    
    if (users.length == 0) {
      //console.log("Deleting room " + roomId);
      //rooms.delete(roomId);
    }
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
        console.log("Deleting room " + roomId);
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
