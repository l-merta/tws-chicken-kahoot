import React, { useEffect, useState } from "react";
import socket from "./components/socket";

interface Message {
  sender: string;
  message: string;
}

const App: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Join the room on mount
    socket.emit("joinRoom", roomId);

    // Listen for incoming messages
    socket.on("receiveMessage", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    // Clean up on unmount
    return () => {
      socket.off("receiveMessage");
    };
  }, [roomId]);

  const sendMessage = () => {
    socket.emit("sendMessage", { roomId, message: input });
    setInput("");
  };

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            {msg.sender}: {msg.message}
          </p>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default App
