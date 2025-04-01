const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Chess } = require("chess.js");

async function getAIMove(fen, apiKey) {
    try {
      
      if (!apiKey?.trim()) throw new Error("Missing API key");
      if (!fen) throw new Error("Missing FEN string");
  
      const chess = new Chess(fen);
      if (chess.isGameOver()) {
        throw new Error("Game is already over");
      }
  
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro-latest",
        generationConfig: {
          maxOutputTokens: 10, 
          temperature: 0.3 
        }
      });
  
      const legalMoves = chess.moves();
      const prompt = `
  You are playing chess as ${chess.turn() === 'w' ? 'white' : 'black'}.
  Current position (FEN): ${fen}
  Legal moves: ${legalMoves.join(', ')}
  
  Respond with EXACTLY ONE move from the legal moves list using Standard Algebraic Notation.
  Examples: ${legalMoves.slice(0, 3).join(', ')}
  
  Your move (must match exactly, no commentary):
  `.trim();
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let move = response.text()
        .trim()
        .replace(/[."']/g, '') 
        .split(/\s+/)[0]; 
  
      
      if (!legalMoves.includes(move)) {
        console.warn(`AI returned invalid move: "${move}". Legal moves: ${legalMoves.join(', ')}`);
        
        move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      }
  
      return move;
  
    } catch (error) {
      console.error("AI move generation failed:", error.message);
      
      try {
        const chess = new Chess(fen);
        const legalMoves = chess.moves();
        if (legalMoves.length > 0) {
          return legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }
      } catch (fallbackError) {
        console.error("Fallback move generation failed:", fallbackError);
      }
      
      return null;
    }
  }
  
  module.exports = {
    getAIMove
  };


class LLMAdapter {
    constructor(provider, apiKey) {
      this.provider = provider;
      this.apiKey = apiKey;
    }
  
    async getMove(fen) {
      switch (this.provider) {
        case "gemini":
          return this.getGeminiMove(fen);
        case "openai":
          return this.getOpenAIMove(fen);
       
        default:
          throw new Error("Unsupported LLM provider");
      }
    }
  
    async getGeminiMove(fen) {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
     
    }
  
    async getOpenAIMove(fen) {
      const openai = new OpenAI({ apiKey: this.apiKey });
     
    }
  }