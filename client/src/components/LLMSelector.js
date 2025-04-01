import React, { useState } from 'react';

function LLMSelector({ onSelect, onApiKeyChange }) {
    const [provider, setProvider] = useState("gemini");
    const [apiKey, setApiKey] = useState("");
  
    return (
      <div className="llm-selector">
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="gemini">Google Gemini</option>
          <option value="openai">OpenAI GPT</option>
        </select>
        <input
          type="password"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button onClick={() => onSelect(provider, apiKey)}>Start Game</button>
      </div>
    );
  }

  export default LLMSelector;