import React from "react";

interface QuestionResultProps {
  questionResult: {
    correctAnswer: string;
    correctIndex: number;
  };
  handleLeave: () => void;
}

const Question: React.FC<QuestionResultProps> = ({ questionResult, handleLeave }) => (
  <>
    <div className="main-room main-game">
      <button onClick={()=>{handleLeave()}}>Opustit hru</button>
      <h1>správná odpověď: {questionResult.correctIndex}. {questionResult.correctAnswer}</h1>
    </div>
  </>
);

export default Question;