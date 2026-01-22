import type { ProviderDefinition, ProviderId } from "./types";

export const PROVIDERS: ProviderDefinition[] = [
  {
    id: "gemini",
    name: "Gemini",
    cli: "gemini",
    installCommand: "npm install -g @google/gemini-cli",
    autoApproveFlag: "--yolomode",
    initialPromptFlag: "-i",
    resumeFlag: "--resume",
  },
  {
    id: "claude",
    name: "Claude Code",
    cli: "claude",
    installCommand: "npm install -g @anthropic-ai/claude-code",
    autoApproveFlag: "-y",
    initialPromptFlag: undefined, // Passed via stdin
    resumeFlag: undefined,
  },
];

export const DEFAULT_PROVIDER_ID: ProviderId = "gemini";

export function getProvider(id: ProviderId): ProviderDefinition | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function getActiveProvider(id?: ProviderId): ProviderDefinition {
  return getProvider(id || DEFAULT_PROVIDER_ID) || PROVIDERS[0];
}
