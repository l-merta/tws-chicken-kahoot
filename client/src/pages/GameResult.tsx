import React, { useEffect, useState } from "react";

import socket from './../components/socket';

interface Player {
  name: string;
  isPlaying: boolean;
  points: number;
}

interface GameResultProps {
  roomId: any;
  handleLeave: () => void;
}

const GameResult: React.FC<GameResultProps> = ({ roomId, handleLeave }) => {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Request the updated player list when the component mounts
    socket.emit("getGameResults", roomId);

    // Listen for the server's response with the player list
    socket.on("gameResults", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    // Cleanup the socket listener when the component unmounts
    return () => {
      socket.off("gameResults");
    };
  }, []);

  // Sort players from best to worst based on their points
  const sortedPlayers = [...players.filter((u) => u.isPlaying)].sort((a, b) => b.points - a.points);

  return (
    <>
      <div className="main-room main-gameEnd">
      <h2>
        <button onClick={handleLeave}>Zpět</button>
        <span>Výsledky hry</span>
      </h2>
        <table className="list-users-points">
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={index}>
                <td className="index">{index + 1}</td> {/* Display the rank */}
                <td className="name">
                  <img src="/images/user/profile.png" />
                  {player.name}
                </td>
                <td className="points">{player.points} bodů</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default GameResult;
