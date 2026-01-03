import { supabase } from './supabase';

interface EdgeFunctionOptions {
  functionName: string;
  body: any;
}

/**
 * Generic edge function invoker with error handling
 */
export async function invokeEdgeFunction<T>({
  functionName,
  body
}: EdgeFunctionOptions): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body
    });

    if (error) {
      throw new Error(error.message || `Edge function ${functionName} invocation failed`);
    }

    if (!data.success) {
      throw new Error(data.error?.message || `Edge function ${functionName} returned error`);
    }

    return data.data;
  } catch (error: any) {
    console.error(`Edge function ${functionName} error:`, error);
    throw error;
  }
}

/**
 * OpenAI Chat Request Types
 */
export interface ChatRequest {
  type: 'chat';
  model: 'gpt-4-turbo' | 'gpt-3.5-turbo';
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string | any;
  }>;
  max_tokens?: number;
  temperature?: number;
}

export interface TranscriptionRequest {
  type: 'transcription';
  audioBase64: string;
  filename: string;
}

export interface VisionRequest {
  type: 'vision';
  model: 'gpt-4-turbo';
  messages: Array<{
    role: 'user';
    content: Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: { url: string };
    }>;
  }>;
  max_tokens?: number;
}

export type OpenAIRequest = ChatRequest | TranscriptionRequest | VisionRequest;

/**
 * Call OpenAI unified edge function
 */
export async function callOpenAI(request: OpenAIRequest) {
  return invokeEdgeFunction({
    functionName: 'openai-unified',
    body: request
  });
}

/**
 * Translate text using DeepL
 */
export async function translateWithDeepL(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<{ translations: Array<{ text: string; detected_source_language?: string }> }> {
  return invokeEdgeFunction({
    functionName: 'deepl-translate',
    body: { text, target_lang: targetLang, source_lang: sourceLang }
  });
}

/**
 * Search Pixabay for images
 */
export async function searchPixabay(
  query: string,
  options?: {
    imageType?: string;
    orientation?: string;
    perPage?: number;
  }
): Promise<{ hits: Array<{ webformatURL: string; [key: string]: any }> }> {
  return invokeEdgeFunction({
    functionName: 'pixabay-search',
    body: { query, ...options }
  });
}
