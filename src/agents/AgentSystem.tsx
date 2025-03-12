import { useState, useEffect } from 'react';

// Agent types
export enum AgentType {
  GENERATOR = 'generator',
  ANALYZER = 'analyzer',
  VISUALIZER = 'visualizer',
  LEARNER = 'learner'
}

// Agent interface
export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  process: (input: any) => Promise<any>;
  isActive: boolean;
}

// Agent system hook
export function useAgentSystem() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Register a new agent
  const registerAgent = (agent: Agent) => {
    setAgents(prev => [...prev, agent]);
  };

  // Run a specific agent
  const runAgent = async (agentId: string, input: any) => {
    setIsProcessing(true);
    try {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) throw new Error(`Agent ${agentId} not found`);
      
      const result = await agent.process(input);
      setResults(result);
      return result;
    } catch (error) {
      console.error("Agent execution error:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Run a pipeline of agents
  const runPipeline = async (agentIds: string[], initialInput: any) => {
    setIsProcessing(true);
    let currentInput = initialInput;
    
    try {
      for (const agentId of agentIds) {
        const agent = agents.find(a => a.id === agentId);
        if (!agent || !agent.isActive) continue;
        
        currentInput = await agent.process(currentInput);
      }
      
      setResults(currentInput);
      return currentInput;
    } catch (error) {
      console.error("Pipeline execution error:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    agents,
    registerAgent,
    runAgent,
    runPipeline,
    isProcessing,
    results
  };
}