/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BE_LINK?: string;
  /** "true" to offer the paid LLM scan as a fallback. */
  readonly VITE_AI_SCAN?: string;
}
