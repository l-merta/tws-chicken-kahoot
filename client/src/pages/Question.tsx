import React, { useEffect, useState } from "react";

interface QuestionProps {
  question: {
    question: string;
    answers: Array<String>;
    time: number;
  };
  handleLeave: () => void;
}

const Question: React.FC<QuestionProps> = ({ question, handleLeave }) => {
  const [timeLeft, setTimeLeft] = useState<number>(question.time);

  // Countdown effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer); // Cleanup timer on unmount
    }
  }, [timeLeft]);

  return (
    <>
      <div className="main-room main-game">
        <div className="question-vp">
          <div className="question-cont">
            <button onClick={() => { handleLeave() }}>Opustit hru</button>
            <span className="question">{question.question}</span>
          </div>
          <div className="question-info">
            {/* <span className="question-count">5 / 10</span> */}
            <span className="question-time-count">{timeLeft}</span> {/* Countdown timer */}
            <img src="https://unsplash.it/1920/1080" alt="Obrázek k otázce" />
            <div className="answers-count">
              <span className="count">{timeLeft}</span>
              <span className="text">Odpovědí</span>
            </div>
          </div>
        </div>
        <div className="answers">
          {question.answers.map((answer, index) => (
            <div className={`ans ans-${index + 1}`} key={index}>
              <i className={`fa-solid fa-${['triangle', 'rhombus', 'circle', 'square'][index % 4]}`}></i>
              <span>{answer}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Question;
