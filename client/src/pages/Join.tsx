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
    <div>
      <h2>Join a Room</h2>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
      />
      <button onClick={handleJoin}>Join Room</button>
    </div>
  );
};

export default Join;
