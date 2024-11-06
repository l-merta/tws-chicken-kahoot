import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "./../components/socket";

interface User {
  id: string;
  name: string;
  role: "host" | "guest";
}

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [newName, setNewName] = useState("");
  const [hostLeftMessage, setHostLeftMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (roomId) {
      socket.emit("joinRoom", roomId);

      socket.on("error", (message: string) => {
        setErrorMessage(message); // Handle the error
      });

      socket.on("roomUsers", (updatedUsers: User[]) => {
        setUsers(updatedUsers);
      });

      socket.on("roleAssigned", (role: "host" | "guest") => {
        setIsHost(role === "host");
      });

      socket.on("hostLeft", (message: string) => {
        setHostLeftMessage(message);
      });

      return () => {
        socket.emit("leaveRoom", roomId);
        socket.off("roomUsers");
        socket.off("roleAssigned");
        socket.off("hostLeft");
        socket.off("error"); // Clean up the error listener
      };
    }
  }, [roomId]);

  const handleLeave = () => {
    navigate("/");
  };

  const handleNameChange = () => {
    if (newName) {
      socket.emit("changeName", { roomId, newName });
      setNewName("");
    }
  };

  // If the error occurs, we prevent rendering the room content
  if (errorMessage) {
    return (
      <div>
        <h2>Room Error</h2>
        <p>{errorMessage}</p>
        <button onClick={() => navigate("/")}>Go back to Home</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Room ID: {roomId}</h2>
      {hostLeftMessage && <p>{hostLeftMessage}</p>}
      <button onClick={handleLeave}>Leave Room</button>
      <div>
        <h3>Users in Room</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} - {user.role}
            </li>
          ))}
        </ul>
      </div>
      {isHost && <p>You are the host!</p>}
      <div>
        <h3>Change your name</h3>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter new name"
        />
        <button onClick={handleNameChange}>Change Name</button>
      </div>
    </div>
  );
};

export default Room;
