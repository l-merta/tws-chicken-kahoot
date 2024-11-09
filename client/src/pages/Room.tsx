import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "./../components/socket";

import './../styles/room.css';

interface UserProps {
  id: string;
  name: string;
  role: "host" | "guest";
}
interface ErrorProps {
  code: number;
  message: string;
}

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProps[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [newName, setNewName] = useState("");
  const [hostLeftMessage, setHostLeftMessage] = useState("");
  const [error, setError] = useState<ErrorProps>();
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (roomId) {
      socket.emit("joinRoom", roomId);

      socket.on("error", (error: ErrorProps) => {
        setError(error);
      });

      socket.on("roomUsers", (updatedUsers: UserProps[]) => {
        setUsers(updatedUsers);
      });

      socket.on("roleAssigned", (role: "host" | "guest") => {
        setIsHost(role === "host");
      });

      socket.on("hostLeft", (message: string) => {
        setHostLeftMessage(message);
      });

      socket.on("gameState", (state: { gameStarted: boolean }) => {
        console.log(state);
        setGameStarted(state.gameStarted);
      });

      return () => {
        socket.emit("leaveRoom", roomId);
        socket.off("roomUsers");
        socket.off("roleAssigned");
        socket.off("hostLeft");
        socket.off("error");
        socket.off("gameState");
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

  const startGame = () => {
    if (isHost) {
      socket.emit("startGame", roomId);
    }
  };

  if (error) {
    return (
      <div className="main-room main-error">
        <h2>
          <span>
            Kód místnosti: <span className="code">{roomId}</span>
          </span>
        </h2>
        <div className="error">
          <h3>Error {error.code}</h3>
          <p>{error.message}</p>
          <button onClick={() => navigate("/")}>Zpět na hlavní stránku</button>
        </div>
      </div>
    );
  }
  if (!gameStarted) {
    return (
      <div className="main-room">
        <h2>
          <button onClick={handleLeave}>Opustit hru</button>
          <span>
            Kód místnosti: <span className="code">{roomId}</span>
          </span>
        </h2>
        {hostLeftMessage && <p>{hostLeftMessage}</p>}
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
        {isHost && (
          <>
            <p>You are the host!</p>
            {!gameStarted && <button onClick={startGame}>Start Game</button>}
          </>
        )}
        <div>
          <h3>Game Status: {gameStarted ? "Game in Progress" : "Waiting to Start"}</h3>
        </div>
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
  }
  else {
    return (
      <div className="main-room main-game">
        <button onClick={handleLeave}>Opustit hru</button>
        <h1>Hello Negga</h1>
      </div>
    )
  }
};

export default Room;
