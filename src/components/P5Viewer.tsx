"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAgentSystem } from '@/agents/AgentSystem';
import { createCodeAnalysisAgent } from '@/agents/CodeAnalysisAgent';

interface P5ViewerProps {
  code: string;
  width?: number;
  height?: number;
  isRunning?: boolean;
}

export default function P5Viewer({
  code,
  width = 400,
  height = 400,
  isRunning = true,
}: P5ViewerProps) {
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
        const result = await runAgent('code-analyzer', { code, language: 'javascript' });
        setSuggestions([...result.suggestions, ...result.optimizations]);
      } catch (error) {
        console.error("Code analysis failed:", error);
      }
    };
    
    analyzeCode();
  }, [code, runAgent]);

  const updateIframeContent = (sketchCode: string, running: boolean) => {
    if (!iframeRef.current) return;

    // Check if the code is an error message or invalid
    if (!sketchCode || sketchCode.trim() === "Error generating code" || !sketchCode.includes("function")) {
      setError("Invalid or no code provided");
      setLoading(false);
      return;
    }

    const loopControl = running ? "" : "noLoop();";

    const iframeContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/addons/p5.sound.min.js"></script>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #f0f0f0;
          }
          canvas {
            display: block;
            margin: 0 auto;
            outline: none;
          }
          /* Make canvas focusable */
          canvas:focus {
            outline: 2px solid #4299e1;
          }
        </style>
      </head>
      <body>
        <script>
          window.prompt = function() { return null; };
          window.alert = function() { return; };
          window.confirm = function() { return false; };
          
          let sketchInitialized = false;
          let canvas;
          
          try {
            ${sketchCode}
            
            if (typeof setup === 'function') {
              const originalSetup = setup;
              setup = function() {
                try {
                  originalSetup();
                  
                  // Make canvas focusable for keyboard events
                  if (window._renderer && window._renderer.canvas) {
                    canvas = window._renderer.canvas;
                    canvas.setAttribute('tabindex', '0');
                    canvas.addEventListener('click', function() {
                      this.focus();
                    });
                  }
                  
                  sketchInitialized = true;
                  window.parent.postMessage({ type: 'loaded' }, '*');
                  ${loopControl}
                } catch (setupError) {
                  window.parent.postMessage({ 
                    type: 'error',
                    message: 'Error in setup: ' + setupError.message 
                  }, '*');
                }
              };
            } else {
              setup = function() {
                canvas = createCanvas(${width}, ${height});
                canvas.canvas.setAttribute('tabindex', '0');
                canvas.canvas.addEventListener('click', function() {
                  this.focus();
                });
                sketchInitialized = true;
                window.parent.postMessage({ type: 'loaded' }, '*');
                ${loopControl}
              };
            }
            
            // Ensure mouse events work correctly
            const originalMousePressed = window.mousePressed || function() {};
            window.mousePressed = function() {
              if (canvas && canvas.canvas) {
                canvas.canvas.focus();
              }
              return originalMousePressed.apply(this, arguments);
            };
            
            const loadTimeout = setTimeout(() => {
              if (!sketchInitialized) {
                window.parent.postMessage({ type: 'loaded' }, '*');
              }
            }, 3000);
            
          } catch (error) {
            window.parent.postMessage({ 
              type: 'error',
              message: 'Error loading sketch: ' + error.message 
            }, '*');
          }
          
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({
              type: 'error',
              message: message,
              source: source,
              lineno: lineno,
              colno: colno
            }, '*');
            return true;
          };
        </script>
      </body>
      </html>
    `;

    iframeRef.current.srcdoc = iframeContent;
  };

  useEffect(() => {
    if (!iframeRef.current) return;

    setLoading(true); // Reset loading state on code or isRunning change
    setError(null);   // Reset error state
    updateIframeContent(code, isRunning);

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "error") {
        setError(
          `${event.data.message} ${event.data.lineno ? `(Line: ${event.data.lineno})` : ""}`
        );
        setLoading(false);
      } else if (event.data.type === "loaded") {
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [code, isRunning]);

  return (
    <div className="w-full rounded-lg overflow-hidden bg-gray-800 border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b">
        <h3 className="font-medium">P5.js Preview</h3>
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
          title="P5.js Sketch"
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-pointer-lock"
          allowFullScreen
        />
      </div>
    </div>
  );
}