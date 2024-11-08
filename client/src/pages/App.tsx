// src/App.tsx
import React from "react";
import { Link } from "react-router-dom";

const App: React.FC = () => (
  <>
    <h1>Welcome to the Quiz Game</h1>
    <Link to="/join">Join a Room</Link> | <Link to="/create">Create a Room</Link>
  </>
);

export default App;