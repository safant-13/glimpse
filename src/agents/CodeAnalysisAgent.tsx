import { Agent, AgentType } from './AgentSystem';

interface CodeAnalysisResult {
  code: string;
  suggestions: string[];
  optimizations: string[];
  bugs: string[];
}

// Update the function signature to accept apiConfig
export function createCodeAnalysisAgent(apiConfig: { provider: string; apiKey: string }): Agent {
  return {
    id: 'code-analyzer',
    type: AgentType.ANALYZER,
    name: 'Code Analyzer',
    description: 'Analyzes code for bugs, optimizations, and best practices',
    isActive: true,
    process: async (input: { code: string, language: string }): Promise<CodeAnalysisResult> => {
      const { code, language } = input;
      
      // This would connect to an AI service in a real implementation
      // For now, we'll simulate the analysis
      const suggestions = [];
      const optimizations = [];
      const bugs: string[] = [];
      
      try {
        // Simple analysis logic (would be replaced with AI-powered analysis)
        if (language === 'javascript' || language === 'typescript') {
          if (code.includes('var ')) {
            suggestions.push('Consider using let or const instead of var for better scoping');
          }
          
          if (code.includes('for (let i = 0;')) {
            optimizations.push('Consider using forEach, map, or filter instead of for loops');
          }
          
          if (code.includes('console.log')) {
            suggestions.push('Remove console.log statements before production');
          }
        }
        
        // HTML analysis
        if (language === 'html') {
          if (code.includes('<img') && !code.includes('alt=')) {
            suggestions.push('Add alt attributes to img tags for better accessibility');
          }
          
          if (code.includes('<table') && !code.includes('<th')) {
            suggestions.push('Consider adding table headers (th) for better semantics');
          }
          
          if (code.includes('onclick=')) {
            optimizations.push('Consider using addEventListener instead of inline event handlers');
          }
          
          if (code.includes('style=')) {
            optimizations.push('Consider moving inline styles to a CSS stylesheet');
          }
        }
        
        // In the future, you could use apiConfig here to call your AI service
        // if (apiConfig.apiKey) {
        //   // Call AI service for more advanced analysis
        // }
      } catch (error) {
        console.error("Error in code analysis:", error);
        // Return empty results instead of crashing
      }
      
      return {
        code,
        suggestions,
        optimizations,
        bugs
      };
    }
  };
}