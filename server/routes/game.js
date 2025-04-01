const express = require('express');
const router = express.Router();
const { getAIMove } = require('../utils/llmService');
const { Chess } = require('chess.js');

router.post('/ai-move', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey?.trim()) {
      return res.status(400).json({ 
        error: "API key required",
        solution: "Please provide a Google Gemini API key in the settings"
      });
    }

    const { fen, provider = 'gemini' } = req.body;
    const chess = new Chess(fen);

    if (chess.isGameOver()) {
      return res.json({ move: null, status: "gameover" });
    }

    const move = await getAIMove(fen, apiKey, provider);
    
  
    res.json({ move });

  } catch (error) {
    console.error('Move error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined  
    });
  }
});

module.exports = router;