// src/App.tsx
import React from "react";
import { Link } from "react-router-dom";

const App: React.FC = () => (
  <>
    <main>
      <div className="s1">
        <a href="https://github.com/l-merta/tws-chicken-kahoot" target="_blank">github</a>
        <h1>SLEPICE</h1>
        <h2>
          Slepičí Kahoot
          <span> | Lukáš Merta</span>
        </h2>
        <div className="links">
          <div className="links-2">
            <Link to="/join" className="link-kahoot">Připojit se do hry</Link>
            <Link to="/create" className="link-kahoot">Vytvořit hru</Link>
          </div>
          <a href="#text" className="link-basic">Přečíst si více o slepicích</a>
        </div>
      </div>
      <div className="s2">
        <img src="images/main_bg.png" alt="" />
      </div>
    </main>
  </>
);

export default App;