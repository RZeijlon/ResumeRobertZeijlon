/**
 * Chat and messaging type definitions
 */

/**
 * Message role type
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Chat message
 */
export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
}

/**
 * Chat request payload
 */
export interface ChatRequest {
  message: string;
  conversation_id?: string;
  use_rag?: boolean;
}

/**
 * Source document from RAG
 */
export interface ChatSource {
  content: string;
  file_path: string;
  similarity?: number;
}

/**
 * Chat response from API
 */
export interface ChatResponse {
  message: string;
  conversation_id: string;
  sources?: ChatSource[];
  timestamp: string;
}
