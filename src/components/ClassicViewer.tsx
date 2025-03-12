"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAgentSystem } from '@/agents/AgentSystem';
import { createCodeAnalysisAgent } from '@/agents/CodeAnalysisAgent';

interface ClassicViewerProps {
  code: string;
  width?: number;
  height?: number;
}

export default function ClassicViewer({
  code,
  width = 400,
  height = 400,
}: ClassicViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Initialize agent system
  const { registerAgent, runAgent, isProcessing } = useAgentSystem();
  
  // Register agents on component mount - FIX: Call the function to create the agent
  useEffect(() => {
    // Create a default API config
    const apiConfig = { provider: "grok", apiKey: "" };
    // Call the function to create the agent instance
    const codeAnalysisAgent = createCodeAnalysisAgent(apiConfig);
    // Register the agent instance
    registerAgent(codeAnalysisAgent);
  }, []);

  // Analyze code with agent when code changes
  useEffect(() => {
    if (!code) return;
    
    const analyzeCode = async () => {
      try {
        const result = await runAgent('code-analyzer', { code, language: 'html' });
        setSuggestions([...result.suggestions, ...result.optimizations]);
      } catch (error) {
        console.error("Code analysis failed:", error);
      }
    };
    
    analyzeCode();
  }, [code, runAgent]);

  useEffect(() => {
    if (!iframeRef.current || !code) return;

    // Only show error if we have code but it's invalid
    if (code.trim() === "Error generating code") {
      setError("Error generating code");
      setLoading(false);
      return;
    }

    // If we don't have a complete HTML document, wrap the code in a basic HTML structure
    let htmlContent = code;
    if (!code.includes("<!DOCTYPE html>") && !code.includes("<html")) {
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
    }

    try {
      // Set the iframe content
      iframeRef.current.srcdoc = htmlContent;
      
      // Handle iframe load event
      const handleLoad = () => {
        setLoading(false);
      };

      iframeRef.current.onload = handleLoad;
    } catch (err) {
      setError("Error rendering HTML content");
      setLoading(false);
    }
  }, [code]);

  return (
    <div className="w-full rounded-lg overflow-hidden bg-gray-800 border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b">
        <h3 className="font-medium">HTML Preview</h3>
        <div className="flex space-x-2">
          {suggestions.length > 0 && (
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
              title="Show Agent Suggestions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-1">{suggestions.length}</span>
            </button>
          )}
          <button
            onClick={() => {
              if (iframeRef.current) {
                if (iframeRef.current.requestFullscreen) {
                  iframeRef.current.requestFullscreen();
                }
              }
            }}
            className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            title="Full Screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-yellow-50 p-3 border-b border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">Agent Suggestions</h4>
          <ul className="list-disc pl-5 text-sm text-yellow-700">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="min-h-[400px] overflow-auto relative" style={{ height: `${height}px` }}>
        {loading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-blue-500 mt-2 text-center">Loading...</p>
          </div>
        )}
        {error && (
          <div className="p-4 text-red-500 bg-red-50 absolute top-0 left-0 w-full z-20">
            <strong>Error:</strong> {error}
          </div>
        )}
        <iframe
          ref={iframeRef}
          title="HTML Preview"
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-pointer-lock"
          allowFullScreen
        />
      </div>
    </div>
  );
}