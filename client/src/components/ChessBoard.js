import React, { useState } from 'react';
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

function ChessBoard() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());

  function onDrop(sourceSquare, targetSquare) {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", 
      });

      if (move === null) return false; 
      setFen(game.fen());
      return true;
    } catch (e) {
      return false;
    }
  }

  return <Chessboard position={fen} onPieceDrop={onDrop} />;
}

export default ChessBoard;