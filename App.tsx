import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { CheckSquare as ChessSquare, Crown } from 'lucide-react';
import { Settings } from './components/Settings';
import { useSettings } from './store/settings';
import { getLLMMove } from './services/llm';
import type { GameState } from './types';

function App() {
  const [game] = useState(new Chess());
  const { selectedProvider, apiKeys, playerColor } = useSettings();
  const [gameState, setGameState] = useState<GameState>({
    fen: game.fen(),
    lastMove: null,
    gameOver: false,
    turn: 'w',
    inCheck: false,
    winner: null
  });
  const [isThinking, setIsThinking] = useState(false);

  const updateGameState = (move: { from: string; to: string }) => {
    setGameState({
      fen: game.fen(),
      lastMove: `${move.from}-${move.to}`,
      gameOver: game.isGameOver(),
      turn: game.turn(),
      inCheck: game.isCheck(),
      winner: game.isCheckmate() ? (game.turn() === 'w' ? 'Black' : 'White') : null
    });
  };

  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    try {
      // Only allow moves if it's the player's turn
      if (game.turn() !== playerColor) return false;

      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (move === null) return false;

      updateGameState(move);
      return true;
    } catch (e) {
      return false;
    }
  }, [game, playerColor]);

  // Handle LLM moves
  useEffect(() => {
    const makeAIMove = async () => {
      if (
        !gameState.gameOver &&
        game.turn() !== playerColor &&
        selectedProvider &&
        apiKeys[selectedProvider]
      ) {
        setIsThinking(true);
        try {
          const move = await getLLMMove(
            game,
            selectedProvider,
            apiKeys[selectedProvider]
          );

          if (move) {
            const result = game.move({
              from: move.substring(0, 2),
              to: move.substring(2, 4),
              promotion: 'q'
            });
            
            if (result) {
              updateGameState(result);
            }
          }
        } catch (e) {
          console.error('Error making AI move:', e);
        } finally {
          setIsThinking(false);
        }
      }
    };

    makeAIMove();
  }, [gameState.lastMove, selectedProvider, playerColor, game]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <ChessSquare className="w-8 h-8" />
          <h1 className="text-3xl font-bold">LLM Chess</h1>
          <Crown className="w-8 h-8" />
        </div>

        <div className="max-w-[600px] mx-auto">
          <Settings />
          
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
            <Chessboard 
              position={gameState.fen}
              onPieceDrop={onDrop}
              boardOrientation={playerColor === 'w' ? 'white' : 'black'}
              customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>

          <div className="mt-6 bg-gray-800 p-6 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">Game Status</h2>
                <p>Turn: {gameState.turn === 'w' ? 'White' : 'Black'}</p>
                {isThinking && (
                  <p className="text-yellow-400">AI is thinking...</p>
                )}
                {gameState.inCheck && (
                  <p className="text-red-500">Check!</p>
                )}
                {selectedProvider && (
                  <p className="text-blue-400">
                    Playing against: {selectedProvider === 'gemini' ? 'Google Gemini' : 'OpenAI GPT'}
                  </p>
                )}
              </div>
              {gameState.gameOver && (
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-400">Game Over!</p>
                  {gameState.winner && (
                    <p className="text-green-400">{gameState.winner} wins!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;