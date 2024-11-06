// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Join from "./pages/Join";
import Room from "./pages/Room";
import Create from "./pages/Create";

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={
        <div>
          <h1>Welcome to the Quiz Game</h1>
          <Link to="/join">Join a Room</Link> | <Link to="/create">Create a Room</Link>
        </div>
      } />
      <Route path="/join" element={<Join />} />
      <Route path="/create" element={<Create />} />
      <Route path="/room/:roomId" element={<Room />} />
    </Routes>
  </Router>
);

export default App;
