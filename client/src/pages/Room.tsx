import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
//import QRCode from 'react-qr-code';
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
  const [newNameSet, setNewNameSet] = useState(false);
  //const [hostLeftMessage, setHostLeftMessage] = useState("");
  const [error, setError] = useState<ErrorProps>();
  const [gameStarted, setGameStarted] = useState(false);
  //const [qrCodeUrl, setQrCodeUrl] = useState('');

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

      /*
      socket.on("hostLeft", (message: string) => {
        setHostLeftMessage(message);
      }); */

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
      setNewNameSet(true);
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
          <span className="code-cont">
            <span className="text">herní PIN:</span>
            <span className="code">{roomId}</span>
            {/* <QRCode value={"url"} size={300} /> */}
          </span>
        </h2>
        <div className="list-users">
          <div className="users-count"><i className="fa-solid fa-user"></i> {users.length}</div>
          {isHost && (!gameStarted && <button className="button-start-game" onClick={startGame}>Spustit hru</button>)}
          <div className="users-cont">
            {users.map((user) => (
              <div className="user" key={user.id}>
                <div className="img-cont">
                  <img src="/images/user/profile.png" alt="" />
                </div>
                <span className="name">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
        {/* {isHost && (!gameStarted && <button onClick={startGame}>Start Game</button>)}
        <div>
          <h3>Game Status: {gameStarted ? "Game in Progress" : "Waiting to Start"}</h3>
        </div> */}
        <div className={"popup-cont " + (newNameSet && "disabled")}>
          <div className="input-text">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Uživatelské jméno"
            />
            <button onClick={handleNameChange}>Nastavit jméno</button>
          </div>
        </div>
      </div>
    );
  }
  else {
    return (
      <div className="main-room main-game">
        <button onClick={handleLeave}>Opustit hru</button>
        <h1>Hello ve hře</h1>
      </div>
    )
  }
};

export default Room;
