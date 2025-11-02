import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { getFromServerCache, setServerCache } from "./serverCache";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || "";
const LLM_PROVIDER = process.env.LLM_PROVIDER || "gemini"; // Default to Gemini

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const anthropic = new Anthropic({ apiKey: CLAUDE_API_KEY });

export async function generateContent(prompt: string, modelName: string = "gemini-2.5-flash", forceReload: boolean = false): Promise<string> {
  const cacheKey = `generateContent-${prompt}-${modelName}`;
  if (!forceReload) {
    const cachedResponse = getFromServerCache(cacheKey);
    if (cachedResponse) {
      console.log("Returning cached response for", cacheKey);
      return cachedResponse;
    }
  }

  if (LLM_PROVIDER === "claude") {
    if (!CLAUDE_API_KEY) {
      console.error("CLAUDE_API_KEY is not set in environment variables.");
      return JSON.stringify({ error: "CLAUDE_API_KEY is not set." });
    }
    try {
      const response = await anthropic.messages.create({
        model: modelName.startsWith("claude") ? modelName : (process.env.CLAUDE_MODEL || "claude-3-opus-20240229"), // Default Claude model
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
      const responseText = response.content[0].text;
      setServerCache(cacheKey, responseText);
      return responseText;
    } catch (error: any) {
      console.error("Error calling Claude API:", error.message, error.stack);
      return JSON.stringify({ error: "Failed to call Claude API", details: error.message });
    }
  } else { // Default to Gemini
    if (!GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is not set in environment variables.");
      return JSON.stringify({ error: "GOOGLE_API_KEY is not set." });
    }
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      setServerCache(cacheKey, responseText);
      return responseText;
    } catch (error: any) {
      console.error("Error calling Gemini API:", error.message, error.stack);
      return JSON.stringify({ error: "Failed to call Gemini API", details: error.message });
    }
  }
}

export async function startChat(history: any[], newMessage: string, modelName: string = "gemini-1.0-pro", demandDescription: string, forceReload: boolean = false): Promise<string> {
  const cacheKey = `startChat-${JSON.stringify(history)}-${newMessage}-${modelName}-${demandDescription}`;
  if (!forceReload) {
    const cachedResponse = getFromServerCache(cacheKey);
    if (cachedResponse) {
      console.log("Returning cached response for", cacheKey);
      return cachedResponse;
    }
  }

  if (LLM_PROVIDER === "claude") {
    if (!CLAUDE_API_KEY) {
      console.error("CLAUDE_API_KEY is not set in environment variables.");
      return JSON.stringify({ error: "CLAUDE_API_KEY is not set." });
    }
    try {
      // Claude's API expects messages in a specific format
      const claudeMessages = history.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.parts[0].text,
      }));
      claudeMessages.push({ role: "user", content: newMessage });

      const response = await anthropic.messages.create({
        model: modelName.startsWith("claude") ? modelName : "claude-3-opus-20240229", // Default Claude model
        max_tokens: 2000, // Max tokens for chat response
        messages: claudeMessages,
      });
      const responseText = response.content[0].text;
      setServerCache(cacheKey, responseText);
      return responseText;
    } catch (error: any) {
      console.error("Error calling Claude Chat API:", error.message, error.stack);
      return JSON.stringify({ error: "Failed to call Claude Chat API", details: error.message });
    }
  } else { // Default to Gemini
    if (!GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is not set in environment variables.");
      return JSON.stringify({ error: "GOOGLE_API_KEY is not set." });
    }
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const generationConfig = { maxOutputTokens: 2000 };
      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ];

      const initialPrompt = demandDescription; // Assuming demandDescription is the initial prompt for Gemini chat

      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            { role: "user", parts: [{ text: initialPrompt }] },
            ...history
        ],
      });

      const result = await chat.sendMessage(newMessage);
      const response = result.response;
      const responseText = response.text();
      setServerCache(cacheKey, responseText);
      return responseText;
    } catch (error: any) {
      console.error("Error calling Gemini Chat API:", error.message, error.stack);
      return JSON.stringify({ error: "Failed to call Gemini Chat API", details: error.message });
    }
  }
}
