/**
 * Shared type definitions for the Idioma-AI application
 */

// ============================================
// User & Profile Types
// ============================================

export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  country_code?: string;
  phone_num?: string;
  start_convo?: boolean;
  daily_phrase?: boolean;
}

// ============================================
// Vocabulary Types
// ============================================

export interface VocabularyWord {
  vocab_id: string;
  word: string;
  word_translated: string;
  list_name: string;
  language: string;
}

// ============================================
// Chat Types
// ============================================

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: Date;
}

// ============================================
// API Response Types
// ============================================

export interface OpenAIChoice {
  message: {
    role: string;
    content: string;
  };
  index: number;
  finish_reason: string;
}

export interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepLTranslation {
  text: string;
  detected_source_language?: string;
}

export interface DeepLResponse {
  translations: DeepLTranslation[];
}

export interface PixabayHit {
  webformatURL: string;
  largeImageURL?: string;
  tags?: string;
  [key: string]: unknown;
}

export interface PixabayResponse {
  hits: PixabayHit[];
  total: number;
  totalHits: number;
}

// ============================================
// Quiz Types
// ============================================

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

// ============================================
// Language Types
// ============================================

export type TargetLanguage =
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Japanese'
  | 'Portuguese'
  | 'Chinese';

export const TARGET_LANGUAGES: TargetLanguage[] = [
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Portuguese',
  'Chinese'
];
