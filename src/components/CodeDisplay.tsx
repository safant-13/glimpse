"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeDisplayProps {
  code: string;
  language: string;
  onCodeChange: (newCode: string) => void;
  onRun: () => void;
  onPause: () => void;
  onReload: () => void;
  isRunning: boolean;
}

export default function CodeDisplay({
  code,
  language,
  onCodeChange,
  onRun,
  onPause,
  onReload,
  isRunning,
}: CodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [editedCode, setEditedCode] = useState(code);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    setEditedCode(code);
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([editedCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `app.${language === "javascript" ? "jsx" : language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRun = () => {
    onCodeChange(editedCode); // Update P5Viewer with edited code
    onRun();
  };

  const handlePause = () => {
    onPause();
  };

  const handleReload = () => {
    setEditedCode(code); // Reset to prop code
    onCodeChange(code);
    onReload();
  };

  return (
    <div className="w-full rounded-xl overflow-hidden bg-gray-800 border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-gray-900 to-purple-900 border-b border-gray-700">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
          >
            {showEditor ? "Hide Editor" : "Edit"}
          </button>
          <button
            onClick={handleRun}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
          >
            Run
          </button>
          <button
            onClick={handlePause}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
          >
            Pause
          </button>
          <button
            onClick={handleReload}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 text-white rounded-md transition-colors"
          >
            Reload
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors"
          >
            Download
          </button>
        </div>
      </div>
      <div className="overflow-auto max-h-[500px]">
        {showEditor ? (
          <textarea
            value={editedCode}
            onChange={(e) => {
              setEditedCode(e.target.value);
              onCodeChange(e.target.value); // Reflect edits immediately
            }}
            className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-y outline-none"
            spellCheck="false"
          />
        ) : (
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: "1rem", background: "transparent" }}
            showLineNumbers
          >
            {editedCode}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}