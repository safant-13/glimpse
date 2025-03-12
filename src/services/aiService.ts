import Grok from "groq-sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";

export async function generateCode(prompt: string, framework: string, provider: string, apiKey: string): Promise<string> {
  console.log("generateCode called with:", { prompt, framework, provider, apiKey: "[hidden]" });

  let fullPrompt;
  if (framework === "react") {
    fullPrompt = `Generate ${framework} code for: ${prompt}. Return your response in this exact format:\n\nexplainfiton\n'''\n[raw JavaScript/TypeScript code for a single React component, no imports (assume React and hooks are available), no comments, no markdown]\n'''\nexplanation\n\nDo not deviate from this structure.`;
  } else if (framework === "p5.js") {
    fullPrompt = `Generate ${framework} code for: ${prompt}. Return your response in this exact format:\n\nexplainfiton\n'''\n[raw JavaScript code for a p5.js sketch, no comments, no markdown]\n'''\nexplanation\n\nDo not deviate from this structure.`;
  } else if (framework === "classic") {
    fullPrompt = `Generate a complete HTML document with embedded CSS and JavaScript for: ${prompt}. The HTML should include visualization elements. Return your response in this exact format:\n\nexplainfiton\n'''\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>${prompt}</title>\n  <style>\n    /* CSS goes here */\n  </style>\n</head>\n<body>\n  <!-- HTML content goes here -->\n  <script>\n    // JavaScript goes here\n  </script>\n</body>\n</html>\n'''\nexplanation\n\nDo not deviate from this structure.`;
  } else if (framework === "analysis") {
    // For code analysis, use the prompt directly
    fullPrompt = prompt;
  } else {
    throw new Error("Unsupported framework");
  }

  let rawResponse: string;

  try {
    switch (provider) {
      case "grok":
        console.log("Calling Grok API...");
        const grok = new Grok({ apiKey });
        const grokResponse = await grok.chat.completions.create({
          messages: [{ role: "user", content: fullPrompt }],
          model: "mixtral-8x7b-32768",
        });
        rawResponse = grokResponse.choices[0].message.content || "Error generating code";
        break;

      case "openai":
        console.log("Calling OpenAI API...");
        const openai = new OpenAI({ apiKey });
        const openaiResponse = await openai.chat.completions.create({
          messages: [{ role: "user", content: fullPrompt }],
          model: "gpt-4o",
        });
        rawResponse = openaiResponse.choices[0].message.content || "Error generating code";
        break;

      case "gemini":
        console.log("Calling Gemini API...");
        const gemini = new GoogleGenerativeAI(apiKey);
        // Updated model name for Gemini API v1.0
        const model = gemini.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        // Use proper chat format for consistency
        const geminiResponse = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        });
        
        // Extract text safely with better error handling
        if (geminiResponse.response && typeof geminiResponse.response.text === 'function') {
          rawResponse = geminiResponse.response.text();
        } else {
          console.warn("Unexpected Gemini response structure:", geminiResponse);
          rawResponse = "Error: Unexpected response format from Gemini";
        }
        break;

      default:
        throw new Error("Unsupported provider");
    }
  } catch (error) {
    // Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error calling ${provider} API:`, error);
    
    // Add fallback provider logic
    if (provider === "gemini") {
      console.log("Attempting to use fallback model for Gemini...");
      try {
        const gemini = new GoogleGenerativeAI(apiKey);
        // Try alternative model
        const model = gemini.getGenerativeModel({ model: "gemini-pro" });
        const geminiResponse = await model.generateContent(fullPrompt);
        rawResponse = geminiResponse.response.text() || "Error generating code";
        console.log("Fallback model succeeded");
      } catch (fallbackError) {
        console.error("Fallback model also failed:", fallbackError);
        throw new Error(`${errorMessage} (Fallback also failed)`);
      }
    } else {
      throw new Error(errorMessage);
    }
  }

  console.log(`Raw response from ${provider}:`, rawResponse);

  // For analysis, we want to return the raw response without the explainfiton/explanation parsing
  if (framework === "analysis") {
    return rawResponse;
  }

  // Use let instead of const to allow reassignment
  let codeMatch = rawResponse.match(/'''([\s\S]*?)'''/);
  if (codeMatch && codeMatch[1]) {
    return codeMatch[1].trim();
  }

  // Try markdown parsing
  codeMatch = rawResponse.match(/```(?:\w+)?\n([\s\S]*?)```/);
  if (codeMatch && codeMatch[1]) {
    return codeMatch[1].trim();
  }

  // Heuristic fallback
  const lines = rawResponse.split("\n");
  const codeLines = lines.filter(line => 
    line.trim() && 
    !line.startsWith("explainfiton") && 
    !line.startsWith("explanation") && 
    !line.match(/^[A-Za-z\s]+:/) && 
    !line.match(/^[\s]*$/)
  );
  if (codeLines.length > 0) {
    return codeLines.join("\n").trim();
  }

  return "Error: Could not parse code from response";
}