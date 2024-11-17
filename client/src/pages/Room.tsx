import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';
import socket from "./../components/socket";

import Question from './Question';
//import QuestionResult from './QuestionResult';
import GameResult from './GameResult';

import './../styles/room.css';

interface UserProps {
  id: string;
  name: string;
  points: number;
  role: "host" | "guest";
  isPlaying: boolean;
}
interface ErrorProps {
  code: number;
  message: string;
}
interface QuestionProps {
  index: number;
  theme: string;
  currentQuestion: number;
  totalQuestions: number;
  question: string;
  answers: Array<String>;
  time: number;
  timeForResult: number;
  playerCount: number;
}
/*
interface QuestionResultProps {
  correctAnswer: string;
  correctIndex: number;
}
*/

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProps[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNameSet, setNewNameSet] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const newNameRef = useRef<string>("");
  //const [hostLeftMessage, setHostLeftMessage] = useState("");
  const [error, setError] = useState<ErrorProps>();
  const [gameTheme, setGameTheme] = useState<any>({});
  const totalQuestionsRef = useRef<HTMLInputElement | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setLoadedGameEnded] = useState(false);
  //const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [question, setLoadedQuestion] = useState<QuestionProps | null>();
  //const [questionResult, setLoadedQuestionResult] = useState<QuestionResultProps | null>();
  const [qrCodeLarge, setQrCodeLarge] = useState(false);

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
      
      socket.on("question", (question: QuestionProps) => {
        setLoadedQuestion(question);
      });
      socket.on("gameTheme", (data: any) => {
        setGameTheme(data);
        if (totalQuestionsRef.current)
          totalQuestionsRef.current.value = data.maxQuestions;
      });
      socket.on("gameState", (state: { gameStarted: boolean }) => {
        setGameStarted(state.gameStarted);
      });
      socket.on("gameEnd", () => {
        setLoadedQuestion(null);
        setLoadedGameEnded(true);
      });

      return () => {
        socket.emit("leaveRoom", roomId);
        socket.off("error");
        socket.off("roomUsers");
        socket.off("roleAssigned");
        socket.off("question");
        socket.off("gameTheme");
        socket.off("gameState");
        socket.off("gameEnd");
      };
    }
  }, [roomId]);

  const handleLeave = () => {
    navigate("/");
  };

  const startGame = () => {
    if (isHost) {
      socket.emit("startGame", roomId);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Update the ref value whenever newName changes
    newNameRef.current = newName;

    // Add event listener for 'Enter' key press
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleNameChange();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [newName]); // Update the ref when newName changes

  const handleNameChange = () => {
    if (newNameRef.current) {
      socket.emit("changeName", { roomId, newName: newNameRef.current });
      setNewNameSet(true);
      setNewName("");
    }
  };
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;

    if (name == "totalQuestions") {
      if (parseInt(e.target.value) < 1)
        e.target.value = "1";
      else if (parseInt(e.target.value) > gameTheme.maxQuestions)
        e.target.value = gameTheme.maxQuestions;
    }

    const { value } = e.target;
    const newValue = value; //type === 'checkbox' ? checked : value;
  
    // Update the gameTheme state (if needed)
    setGameTheme((prevTheme: any) => ({
      ...prevTheme,
      [name]: newValue,
    }));
  
    // Emit the change to the server
    socket.emit('changeTheme', { roomId, changed: name, newValue: newValue });
  };
  const handleUserPlayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIsPlaying = e.target.checked;
    
    // Emit the change to the server
    socket.emit("toggleIsPlaying", { roomId, isPlaying: newIsPlaying });
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
          <span className={"code-cont code-cont-qr " + (qrCodeLarge ? "code-cont-qr-large" : "")}>
            <div className="s1">
              <span className="text">herní PIN:</span>
              <span className="code">{roomId}</span>
            </div>
            <div className="s2">
              <QRCodeSVG className="qr-code" onClick={()=>{setQrCodeLarge(prev => !prev)}} value={window.location.href} />
            </div>
          </span>
        </h2>
        <div className="list-users">
          <div className="users-count"><i className="fa-solid fa-user"></i> {users.filter(user => user.isPlaying).length}</div>
          <div className="users-cont">
            {users.map((user) => (
              <div className={"user " + (!user.isPlaying ? "user-notPlaying" : "")} key={user.id}>
                <div className="img-cont">
                  <img src="/images/user/profile.png" alt="" />
                </div>
                <span className="name">{user.name}</span>
              </div>
            ))}
          </div>
          {!isHost &&
            <span className="game-theme">{gameTheme.themeDisplayName}</span>
          }
          {isHost && 
            <div className="host-menu">
              <button className={"button-start-game " + (users.filter(user => user.isPlaying).length == 0 ? "button-start-game-inactive" : "")} onClick={startGame}>Spustit hru</button>
              <div className="settings">
                <div className="item">
                  <span>Zúčastnit se</span>
                  <input type="checkbox" name="hostPlay" id="hostPlay" value={users.filter(user => user.role == "host")[0].isPlaying ? "true" : "false"} onChange={handleUserPlayChange} />
                </div>
                <div className="item">
                  <span>Téma</span>
                  <select name="gameTheme" id="gameTheme" onChange={(e) => handleSettingsChange(e)}>
                    {gameTheme.availableThemes.map((theme: any) => (
                      <option value={theme.fileName}>{theme.name}</option>
                    ))}
                  </select>
                </div>
                <div className="item">
                  <span>Počet otázek</span>
                  <input type="number" ref={totalQuestionsRef} defaultValue={gameTheme.totalQuestions} min={1} max={gameTheme.maxQuestions} name="totalQuestions" id="totalQuestions"  onChange={(e) => handleSettingsChange(e)} />
                </div>
              </div>
            </div>
          }
        </div>
        <div className={"popup-cont " + (newNameSet && "disabled")}>
          <div className="input-text">
            <input
              type="text"
              ref={inputRef}
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
    if (question) {return (<Question question={question} handleLeave={handleLeave}/>)}
    else if (gameEnded) {return (<GameResult roomId={roomId} handleLeave={handleLeave}/>)}
    {/* else if (questionResult) { return (<QuestionResult questionResult={questionResult} handleLeave={handleLeave}/>)} */}
  }
};

export default Room;
