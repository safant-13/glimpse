"use client";

import React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          <span className="text-sm font-medium text-gray-300">{clampedProgress}%</span>
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
}