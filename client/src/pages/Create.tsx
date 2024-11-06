// src/components/Create.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "./../components/socket";

const Create: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Generate a random 5-digit room ID and check availability with server
    const createRoom = () => {
      const roomId = Math.floor(10000 + Math.random() * 90000).toString();
      socket.emit("createRoom", roomId, (isAvailable: boolean) => {
        if (isAvailable) {
          navigate(`/room/${roomId}`);
        } else {
          createRoom();
        }
      });
    };

    createRoom();
  }, [navigate]);

  return <div>Creating Room...</div>;
};

export default Create;
