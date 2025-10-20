import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app-container">
      <header>
        <h1>Bienvenue sur React + Vite!</h1>
        <p>Une page stylisée pour tester ton application</p>
      </header>

      <div className="logo-container">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} alt="Vite logo" className="logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} alt="React logo" className="logo react" />
        </a>
      </div>

      <div className="card">
        <h2>Compteur interactif</h2>
        <button onClick={() => setCount((c) => c + 1)}>
          Count is {count}
        </button>
        <p>Click le bouton pour augmenter le compteur.</p>
      </div>

      <footer>
        <p>Crée avec ❤️ par React + Vite</p>
      </footer>
    </div>
  );
}

export default App;
