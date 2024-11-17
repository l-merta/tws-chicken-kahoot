// src/App.tsx
import React from "react";
import { Link } from "react-router-dom";

const App: React.FC = () => (
  <>
    <main>
      <div className="s1">
        <a className="link-github" href="https://github.com/l-merta/tws-chicken-kahoot" target="_blank">
          <i className="fa-brands fa-square-github"></i>
          <span>Github</span>
        </a>
        <h1>SLEPICE</h1>
        <h2>
          <span>Slepičí Kahoot</span>
          <span className="author"> | Lukáš Merta</span>
        </h2>
        <div className="links">
          <div className="links-2">
            <Link to="/join" className="link-kahoot">Připojit se do hry</Link>
            <Link to="/create" className="link-kahoot link-kahoot-create">Vytvořit hru</Link>
          </div>
          <a href="#text" className="link-basic">Přečíst si více o slepicích</a>
        </div>
      </div>
      <div className="s2">
        <img src="images/main_bg.png" alt="" />
      </div>
    </main>
    <div id="text"></div>
    <section>
      <img src="images/s1.png" alt="" />
      <div className="text">
        <h2>Domestikace a historie</h2>
        <p>Slepice jsou jedním z nejstarších domestikovaných zvířat, jejichž původ sahá do jihovýchodní Asie, kde byly původně chovány pro kohoutí zápasy a vejce. Archeologické nálezy ukazují, že se slepice rozšířily do Evropy a dalších částí světa díky obchodním cestám. Dnes jsou základem zemědělství a jedním z nejčastěji chovaných zvířat na světě, poskytující lidem nejen vejce a maso, ale také významný zdroj hnojiva a pestřejší zemědělský ekosystém.</p>
      </div>
    </section>
    <section>
      <div className="text">
        <h2>Biologie a chování</h2>
        <p>Slepice jsou známé svou společenskou povahou a hierarchickým uspořádáním nazývaným „slepice pánve“ nebo „klovací pořádek“. Tento systém určuje, která slepice je ve skupině dominantní a má přístup k nejlepším zdrojům potravy. Slepice mají také překvapivě dobré kognitivní schopnosti a jsou schopné rozpoznávat až 100 jednotlivých členů své skupiny, stejně jako různé tváře lidí.</p>
      </div>
      <img src="images/s2.png" alt="" />
    </section>
    <section>
      <img src="images/s3.png" alt="" />
      <div className="text">
        <h2>Význam pro životní prostředí</h2>
        <p>Chov slepic na venkově nebo v menších domácích podmínkách přináší výhody pro ekologii i udržitelnost. Slepice jsou přirozenými recyklátory, protože konzumují zbytky z domácnosti a přeměňují je na vejce bohatá na živiny. Jejich přítomnost v zahradách může přispět ke snížení počtu škůdců, zatímco jejich trus je cenným hnojivem pro zlepšení kvality půdy. Tento cyklus vytváří udržitelnější a méně odpadní přístup k životu.</p>
      </div>
    </section>
  </>
);

export default App;