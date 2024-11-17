// src/components/Join.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Join: React.FC = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div className="main-room main-join">
      <h2>
        <button onClick={() => navigate("/")}>Zpět</button>
        <span>Připojit se do hry</span>
      </h2>
      <div className="input-text">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Herní PIN"
        />
        <button onClick={handleJoin}>Připojit se</button>
      </div>
    </div>
  );
};

export default Join;
