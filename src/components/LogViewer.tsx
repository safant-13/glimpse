"use client";
import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";

export default function LogViewer() {
  const [logs, setLogs] = useState(logger.getLogs());

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...logger.getLogs()]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gray-800 text-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-2 bg-gray-900">
        <h3 className="font-medium">Logs</h3>
      </div>
      <div className="max-h-[200px] overflow-auto p-4">
        {logs.length === 0 ? (
          <p>No logs yet.</p>
        ) : (
          logs.map((log, index) => (
            <p key={index} className="text-sm">
              [{log.timestamp}] {log.message}
            </p>
          ))
        )}
      </div>
    </div>
  );
}