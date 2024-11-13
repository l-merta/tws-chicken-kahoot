import React from "react";

interface GameResultProps {
  handleLeave: () => void;
}

const GameResult: React.FC<GameResultProps> = ({ handleLeave }) => (
  <>
    <div className="main-room main-game">
      <button onClick={()=>{handleLeave()}}>Opustit hru</button>
      <h1>Konec hry čau</h1>
    </div>
  </>
);

export default GameResult;