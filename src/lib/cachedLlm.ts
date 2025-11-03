'use client';

import { useApiCache } from '../app/context/ApiCacheContext';
import { generateContent as originalGenerateContent, startChat as originalStartChat } from './llm';

export function useCachedLlm() {
  const { getCache, updateCache } = useApiCache();

  const generateContent = async (prompt: string, modelName?: string, forceReload: boolean = false): Promise<string> => {
    const cacheKey = `generateContent-${prompt}-${modelName}`;
    if (!forceReload) {
      const cachedResponse = getCache(cacheKey);
      if (cachedResponse) {
        console.log('Returning cached response for', cacheKey);
        return cachedResponse;
      }
    }

    const response = await originalGenerateContent(prompt, modelName);
    updateCache(cacheKey, response);
    return response;
  };

  const startChat = async (history: any[], newMessage: string, modelName: string = "gemini-1.0-pro", demandDescription: string, forceReload: boolean = false): Promise<string> => {
    const cacheKey = `startChat-${JSON.stringify(history)}-${newMessage}-${modelName}-${demandDescription}`;
    if (!forceReload) {
      const cachedResponse = getCache(cacheKey);
      if (cachedResponse) {
        console.log('Returning cached response for', cacheKey);
        return cachedResponse;
      }
    }

    const response = await originalStartChat(history, newMessage, modelName, demandDescription);
    updateCache(cacheKey, response);
    return response;
  };

  return { generateContent, startChat };
}
