"use client";

import { useState } from "react";
import PromptInput from "@/components/PromptInput";
import CodeDisplay from "@/components/CodeDisplay";
import CodeViewer from "@/components/CodeViewer";
import P5Viewer from "@/components/P5Viewer";
import LogViewer from "@/components/LogViewer";
import ClassicViewer from "@/components/ClassicViewer";
import axios from "axios";
import { logger } from "@/lib/logger";

// Add this import at the top with other imports
import ProgressBar from "@/components/ProgressBar";

export default function Home() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [framework, setFramework] = useState("react");
  const [isRunning, setIsRunning] = useState(true);
  // Add this new state for progress
  const [progress, setProgress] = useState(0);

  const handleGenerate = async (
    prompt: string,
    selectedFramework: string,
    apiConfig: { provider: string; apiKey: string }
  ) => {
    setIsLoading(true);
    setFramework(selectedFramework);
    setProgress(10); // Start progress
    logger.log(`Generating ${selectedFramework} code for prompt: "${prompt}" using ${apiConfig.provider}`);
    
    try {
      // Simulate progress steps
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          // Increase progress but cap at 90% until we get the actual response
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      const response = await axios.post("/api/generate", {
        prompt,
        framework: selectedFramework,
        ...apiConfig,
      });
      
      clearInterval(progressInterval);
      setProgress(100); // Complete progress
      setCode(response.data.code);
      logger.log("Code generated successfully");
      
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error("Error generating code:", error);
      setCode("Error generating code");
      setProgress(0); // Reset progress on error
      // logger.log(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode); // Update code in parent to reflect in P5Viewer
  };

  const handleRun = () => {
    setIsRunning(true); // Start the P5 sketch
  };

  const handlePause = () => {
    setIsRunning(false); // Pause the P5 sketch
  };

  const handleReload = () => {
    setIsRunning(false); // Stop running and reset code
    // Optionally reset to initial generated code if you store it separately
  };

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-white">Glimpse: Visualize Your Ideas</h1>
      
      {/* Add progress bar when loading */}
      {isLoading && (
        <div className="mb-4">
          <ProgressBar progress={progress} label="Generating code..." />
        </div>
      )}
      
      <div className="flex flex-1 gap-4">
        <div className="w-1/3">
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
        <div className="w-1/3 flex flex-col gap-4">
          <CodeDisplay
            code={code}
            language="javascript"
            onCodeChange={handleCodeChange}
            onRun={handleRun}
            onPause={handlePause}
            onReload={handleReload}
            isRunning={isRunning}
          />
          <LogViewer />
        </div>
                <div className="w-1/3">
                  {framework === "react" ? (
                    <CodeViewer code={code} />
                  ) : framework === "p5.js" ? (
                    <P5Viewer code={code} isRunning={isRunning} />
                  ) : framework === "classic" ? (
                    <ClassicViewer code={code} />
                  ) : (
                    <div className="p-4 text-red-500">Unsupported framework</div>
                  )}
                </div>
      </div>
    </div>
  );
}