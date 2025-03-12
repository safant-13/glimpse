"use client";
import { useEffect, useState } from "react";
import * as Babel from "@babel/standalone";
import React from "react";
import ReactDOM from "react-dom/client";

interface CodeViewerProps {
  code: string;
}

export default function CodeViewer({ code }: CodeViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [viewerRef, setViewerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!code || !viewerRef) return;

    try {
      // Remove or replace import statements since React is provided
      let cleanedCode = code
        .replace(/import\s+React(?:,\s*{[^}]*})?\s+from\s+['"]react['"];?/g, "")
        .trim();

      // Transform JSX to JS
      const transformedCode = Babel.transform(cleanedCode, {
        presets: ["react"],
      }).code;

      // Evaluate the code with React and ReactDOM provided
      const evalCode = new Function(
        "React",
        "ReactDOM",
        `
          ${transformedCode}
          // Find the default exported component (e.g., Calculator, App)
          const Component = typeof Calculator !== 'undefined' ? Calculator : 
                           typeof App !== 'undefined' ? App : null;
          if (!Component) throw new Error("No recognizable component (e.g., App or Calculator) found");
          const root = ReactDOM.createRoot(document.createElement('div'));
          root.render(React.createElement(Component));
          return root;
        `
      );

      while (viewerRef.firstChild) {
        viewerRef.removeChild(viewerRef.firstChild);
      }

      const root = evalCode(React, ReactDOM);
      viewerRef.appendChild(root._internalRoot.containerInfo);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Render Error: ${errorMessage}`);
    }
  }, [code, viewerRef]);

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-2 bg-gray-100 border-b">
        <h3 className="font-medium">Live Preview</h3>
      </div>
      <div className="min-h-[500px] overflow-auto">
        {error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : (
          <div ref={setViewerRef} className="p-4" />
        )}
      </div>
    </div>
  );
}