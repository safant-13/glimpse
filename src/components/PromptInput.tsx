"use client";
import { useState } from "react";

interface PromptInputProps {
  onGenerate: (prompt: string, framework: string, apiConfig: ApiConfig) => void;
  isLoading: boolean;
}

interface ApiConfig {
  provider: string;
  apiKey: string;
}

export default function PromptInput({ onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("react");
  const [provider, setProvider] = useState("grok");
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && apiKey.trim()) {
      onGenerate(prompt, framework, { provider, apiKey });
    }
  };

  return (
    <div className="w-full p-4 bg-gray-800 text-gray-200 rounded-lg shadow-lg border border-gray-700">
    <h2 className="text-xl font-bold mb-4 text-white">Describe Your Web App</h2>
    <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">
            Your Idea
          </label>
          <textarea
            id="prompt"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your app or sketch..."
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="framework" className="block text-sm font-medium text-gray-300 mb-1">
            Framework
          </label>
          <select
            id="framework"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100"
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
          >
            <option value="react">React</option>
            <option value="p5.js">P5.js</option>
            <option value="classic">Classic HTML</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="provider" className="block text-sm font-medium text-gray-300 mb-1">
            AI Provider
          </label>
          <select
            id="provider"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="grok">Grok</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">
            API Key
          </label>
          <input
            id="apiKey"
            type="text"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          disabled={isLoading || !prompt.trim() || !apiKey.trim()}
        >
          {isLoading ? "Generating..." : "Generate"}
        </button>
      </form>
    </div>
  );
}