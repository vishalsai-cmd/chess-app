import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import './App.css';

function App() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [gameStatus, setGameStatus] = useState('setup'); 
  const [aiThinking, setAiThinking] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [llmProvider, setLlmProvider] = useState('gemini');
  const [moveHistory, setMoveHistory] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [boardWidth, setBoardWidth] = useState(600);


  const initGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setGameStatus('playing');
    

    if (llmProvider === 'white') {
      makeAIMove();
    }
  };

 
  const onDrop = (sourceSquare, targetSquare) => {
    if (gameStatus !== 'playing' || aiThinking) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (!move) return false;

      setFen(game.fen());
      setMoveHistory([...moveHistory, `${move.piece.toUpperCase()} ${move.from}-${move.to}`]);
      checkGameStatus();
      
      if (!game.isGameOver()) {
        setTimeout(makeAIMove, 500);
      }

      return true;
    } catch {
      return false;
    }
  };

  
  const makeAIMove = async () => {
    setAiThinking(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/game/ai-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen: game.fen(), apiKey, provider: llmProvider }),
      });

      const data = await response.json();
      
      if (data.move) {
        const move = game.move(data.move, { sloppy: true });
        if (move) {
          setFen(game.fen());
          setMoveHistory([...moveHistory, `AI (${move.piece}) ${move.from}-${move.to}`]);
          checkGameStatus();
        }
      }
    } catch (error) {
      console.error('AI move error:', error);
    } finally {
      setAiThinking(false);
    }
  };

  
  const checkGameStatus = () => {
    if (game.isGameOver()) {
      setGameStatus('gameover');
    }
  };

  
  const resetGame = () => {
    setGameStatus('setup');
    setApiKey('');
  };

  
  useEffect(() => {
    const handleResize = () => {
      setBoardWidth(Math.min(window.innerWidth - 40, 600));
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Chess with AI</h1>
{/*         <button 
          className="settings-btn"
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          ⚙️ Settings
        </button> */}
      </header>

{/*       {settingsOpen && (
        <div className="settings-panel">
          <h3>Game Settings</h3>
          <div className="form-group">
            <label>AI Provider:</label>
            <select 
              value={llmProvider} 
              onChange={(e) => setLlmProvider(e.target.value)}
              disabled={gameStatus === 'playing'}
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>
          <div className="form-group">
            <label>AI Plays As:</label>
            <select 
              value={llmProvider} 
              onChange={(e) => setLlmProvider(e.target.value === 'white' ? 'white' : 'black')}
              disabled={gameStatus === 'playing'}
            >
              <option value="black">Black</option>
              <option value="white">White</option>
            </select>
          </div>
          <div className="form-group">
            <label>Board Size:</label>
            <input
              type="range"
              min="300"
              max="800"
              value={boardWidth}
              onChange={(e) => setBoardWidth(parseInt(e.target.value))}
            />
          </div>
          <button onClick={() => setSettingsOpen(false)}>Close</button>
        </div>
      )} */}

      {gameStatus === 'setup' ? (
        <div className="setup-screen">
          <h2>Configure Your Game</h2>
          <div className="api-key-input">
            <input
              type="password"
              placeholder="Enter Google Gemini API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <button 
            onClick={initGame}
            disabled={!apiKey.trim()}
          >
            Start Game
          </button>
        </div>
      ) : (
        <div className="game-container">
          <div className="chessboard-container">
            <Chessboard 
              position={fen} 
              onPieceDrop={onDrop}
              boardWidth={boardWidth}
              customBoardStyle={{
                borderRadius: '4px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
              }}
              customDarkSquareStyle={{ backgroundColor: '#779556' }}
              customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
            />
            {aiThinking && (
              <div className="thinking-indicator">
                <div className="spinner"></div>
                <span>AI is thinking...</span>
              </div>
            )}
          </div>

          <div className="game-info">
            <div className="status-panel">
              <h3>Game Status</h3>
              <p>Turn: <strong>{game.turn() === 'w' ? 'White' : 'Black'}</strong></p>
              {game.isCheck() && <p className="check-warning">CHECK!</p>}
              {gameStatus === 'gameover' && (
                <p className="gameover-message">
                  Game Over - {game.isCheckmate() ? 'Checkmate!' : 'Draw!'}
                </p>
              )}
            </div>

           <div className="move-history">
              <h3>Move History</h3>
              <div className="moves-list">
                {moveHistory.map((move, i) => (
                  <div key={i} className={`move ${i % 2 === 0 ? 'white' : 'black'}`}>
                    {Math.floor(i/2) + 1}. {move}
                  </div>
                ))}
              </div>
            </div> 

            <div className="game-controls">
              <button onClick={resetGame}>New Game</button>
              <button onClick={() => navigator.clipboard.writeText(fen)}>
                Copy FEN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;