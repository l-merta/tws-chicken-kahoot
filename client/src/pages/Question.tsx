import React from "react";

interface QuestionProps {
  question: {
    question: string;
    answers: Array<String>;
    time: number;
  };
  handleLeave: () => void;
}

const Question: React.FC<QuestionProps> = ({ question }, handleLeave) => (
  <>
    <div className="main-room main-game">
      <button onClick={()=>{handleLeave()}}>Opustit hru</button>
      <h1>{question.question}</h1>
    </div>
  </>
);

export default Question;