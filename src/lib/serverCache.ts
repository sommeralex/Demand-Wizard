const serverCache = new Map<string, string>();

export function getFromServerCache(key: string): string | undefined {
  return serverCache.get(key);
}

export function setServerCache(key: string, value: string): void {
  serverCache.set(key, value);
}

export function clearServerCache(): void {
  serverCache.clear();
  console.log("Server cache cleared.");
}
