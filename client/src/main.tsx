import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './styles/index.css';
import './styles/main.css';

import App from './pages/App';
import Join from "./pages/Join";
import Room from "./pages/Room";
import Create from "./pages/Create";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/join" element={<Join />} />
        <Route path="/create" element={<Create />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </Router>
  </StrictMode>,
);