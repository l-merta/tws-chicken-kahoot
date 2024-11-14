import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from './../components/socket';

interface QuestionProps {
  question: {
    question: string;
    answers: Array<String>;
    time: number;
    playerCount: number;
  };
  handleLeave: () => void;
}
interface AnswerCount {
  answeredCount: number;
  totalUsers: number;
}

const Question: React.FC<QuestionProps> = ({ question, handleLeave }) => {
  const {roomId} = useParams<{ roomId: string }>();
  const [questionData, setQuestionData] = useState<any>(question);
  const [timeLeft, setTimeLeft] = useState<number>(question.time);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  //const [answerResults, setAnswerResults] = useState<{ correctIndex: number } | null>(null);
  const [answerCount, setAnswerCount] = useState<AnswerCount>({
    answeredCount: 0,
    totalUsers: question.playerCount
  });

  // Countdown effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer); // Cleanup timer on unmount
    }
  }, [timeLeft]);

  useEffect(() => {
    //
    socket.on("question", (question: any) => {
      console.log("question in Question.tsx")
      setQuestionData(question);
      setTimeLeft(question.time);
      setAnswerCount({
        answeredCount: 0,
        totalUsers: question.playerCount
      })
      //setLoadedQuestionResult(null);
    });
    // Listen for the result from the server
    socket.on("questionResult", (data) => {
      console.log(data);
      setTimeLeft(0);
      setCorrectAnswerIndex(data.correctIndex - 1); // Convert 1-based to 0-based
      //setAnswerResults(data);
      //
      console.log("sel: ", selectedAnswer);
      console.log("cor: ", data.correctIndex - 1);
      //
      setTimeout(() => {
        setSelectedAnswer(null); // Reset for the next question
        setCorrectAnswerIndex(null);
      }, 3000); // Display result for 3 seconds
    });
    // Listen for the result from the server
    socket.on("answerProgress", (data: any) => {
      console.log(data);
      setAnswerCount(data);
    });

    return () => {
      socket.off("questionResult");
    };
  }, []);

  const handleAnswerClick = (index: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    setSelectedAnswer(index);
    socket.emit("submitAnswer", { roomId: roomId, answerIndex: index }); // Replace with actual room ID
  };

  return (
    <>
      <div className="main-room main-game">
        <div className="question-vp">
          <div className="question-cont">
            <button onClick={() => { handleLeave() }}>Opustit hru</button>
            <span className="question">{questionData.question}</span>
          </div>
          <div className="question-info">
            {/* <span className="question-count">5 / 10</span> */}
            <span className="question-time-count">{timeLeft}</span> {/* Countdown timer */}
            <img src="https://unsplash.it/1920/1080" alt="Obrázek k otázce" />
            <div className="answers-count">
              <span className="count">{answerCount.answeredCount} / {answerCount.totalUsers}</span>
              <span className="text">Odpovědí</span>
            </div>
          </div>
        </div>
        <div className="answers">
          {questionData.answers.map((answer: string, index: number) => (
            <button
              key={index}
              className={
                "ans ans-" + (index + 1) + " " +
                (correctAnswerIndex !== null
                  ? index === correctAnswerIndex
                    ? "ans-correct"
                    : index === selectedAnswer
                    ? "ans-selected"
                    : "ans-left"
                  : "")
              }
              onClick={() => handleAnswerClick(index)}
            >
              <i className={`fa-solid fa-${["triangle", "rhombus", "circle", "square"][index % 4]}`}></i>
              <span>{answer}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Question;
