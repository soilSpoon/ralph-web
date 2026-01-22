import { IAgentProvider } from "./provider-interface";
import { GeminiProvider } from "./providers/gemini";
import { ProviderId } from "./types";

// Registry of instantiated providers
const providerRegistry = new Map<ProviderId, IAgentProvider>();

// Register providers
const gemini = new GeminiProvider();
providerRegistry.set(gemini.id, gemini);

// Claude provider stub (can be implemented later)
// providerRegistry.set("claude", new ClaudeProvider());

export const DEFAULT_PROVIDER_ID: ProviderId = "gemini";

/**
 * Get a provider instance by ID.
 */
export function getProvider(id: ProviderId): IAgentProvider | undefined {
  return providerRegistry.get(id);
}

/**
 * Get the active provider or default if not found.
 */
export function getActiveProvider(id?: ProviderId): IAgentProvider {
  return getProvider(id || DEFAULT_PROVIDER_ID) || gemini;
}

/**
 * Get all registered providers
 */
export function getAllProviders(): IAgentProvider[] {
  return Array.from(providerRegistry.values());
}
