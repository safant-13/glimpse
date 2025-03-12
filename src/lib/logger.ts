interface LogEntry {
    timestamp: string;
    message: string;
  }
  
  class Logger {
    private logs: LogEntry[] = [];
  
    log(message: string) {
      const entry = { timestamp: new Date().toISOString(), message };
      this.logs.push(entry);
      console.log(`[${entry.timestamp}] ${message}`);
    }
  
    getLogs() {
      return this.logs;
    }
  }
  
  export const logger = new Logger();