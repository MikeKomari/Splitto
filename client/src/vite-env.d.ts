/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BE_LINK?: string;
  /** "true" to offer the paid LLM scan as a fallback. */
  readonly VITE_AI_SCAN?: string;
  /** "memory" for the sandboxed preview build. */
  readonly VITE_ROUTER?: string;
  /** Extra extension the OCR model is served with (preview hosts only). */
  readonly VITE_OCR_MODEL_EXT?: string;
}
