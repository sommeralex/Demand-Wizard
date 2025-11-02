'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ApiCacheContextType {
  cache: Map<string, string>;
  getCache: (key: string) => string | undefined;
  updateCache: (key: string, value: string) => void;
  clearCache: () => void;
}

const ApiCacheContext = createContext<ApiCacheContextType | undefined>(undefined);

export function ApiCacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Map<string, string>>(new Map());

  const getCache = useCallback((key: string) => {
    return cache.get(key);
  }, [cache]);

  const updateCache = useCallback((key: string, value: string) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(key, value);
      return newCache;
    });
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return (
    <ApiCacheContext.Provider value={{ cache, getCache, updateCache, clearCache }}>
      {children}
    </ApiCacheContext.Provider>
  );
}

export function useApiCache() {
  const context = useContext(ApiCacheContext);
  if (context === undefined) {
    throw new Error('useApiCache must be used within an ApiCacheProvider');
  }
  return context;
}
