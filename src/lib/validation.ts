/**
 * API Response Validation Utilities
 *
 * Provides type-safe extraction and validation of API responses
 * to prevent runtime errors from malformed responses.
 */

import type { OpenAIChatResponse, DeepLResponse, PixabayResponse } from '../types';

/**
 * Validates and extracts content from OpenAI chat response
 * @throws Error if response is malformed
 */
export function extractOpenAIContent(response: unknown): string {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid OpenAI response: response is not an object');
  }

  const r = response as Record<string, unknown>;

  if (!r.choices || !Array.isArray(r.choices)) {
    throw new Error('Invalid OpenAI response: missing choices array');
  }

  if (r.choices.length === 0) {
    throw new Error('Invalid OpenAI response: choices array is empty');
  }

  const firstChoice = r.choices[0] as Record<string, unknown>;

  if (!firstChoice.message || typeof firstChoice.message !== 'object') {
    throw new Error('Invalid OpenAI response: missing message in first choice');
  }

  const message = firstChoice.message as Record<string, unknown>;

  if (typeof message.content !== 'string') {
    throw new Error('Invalid OpenAI response: message content is not a string');
  }

  return message.content;
}

/**
 * Safely extracts content from OpenAI response, returning null on failure
 */
export function safeExtractOpenAIContent(response: unknown): string | null {
  try {
    return extractOpenAIContent(response);
  } catch {
    return null;
  }
}

/**
 * Validates OpenAI response structure
 */
export function isValidOpenAIResponse(response: unknown): response is OpenAIChatResponse {
  if (!response || typeof response !== 'object') return false;

  const r = response as Record<string, unknown>;

  if (!Array.isArray(r.choices) || r.choices.length === 0) return false;

  const firstChoice = r.choices[0] as Record<string, unknown>;
  if (!firstChoice.message || typeof firstChoice.message !== 'object') return false;

  const message = firstChoice.message as Record<string, unknown>;
  return typeof message.content === 'string';
}

/**
 * Validates and extracts translations from DeepL response
 * @throws Error if response is malformed
 */
export function extractDeepLTranslation(response: unknown): string {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid DeepL response: response is not an object');
  }

  const r = response as Record<string, unknown>;

  if (!r.translations || !Array.isArray(r.translations)) {
    throw new Error('Invalid DeepL response: missing translations array');
  }

  if (r.translations.length === 0) {
    throw new Error('Invalid DeepL response: translations array is empty');
  }

  const firstTranslation = r.translations[0] as Record<string, unknown>;

  if (typeof firstTranslation.text !== 'string') {
    throw new Error('Invalid DeepL response: translation text is not a string');
  }

  return firstTranslation.text;
}

/**
 * Validates DeepL response structure
 */
export function isValidDeepLResponse(response: unknown): response is DeepLResponse {
  if (!response || typeof response !== 'object') return false;

  const r = response as Record<string, unknown>;

  if (!Array.isArray(r.translations) || r.translations.length === 0) return false;

  const firstTranslation = r.translations[0] as Record<string, unknown>;
  return typeof firstTranslation.text === 'string';
}

/**
 * Validates and extracts image URL from Pixabay response
 * @throws Error if response is malformed or no images found
 */
export function extractPixabayImageUrl(response: unknown): string {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid Pixabay response: response is not an object');
  }

  const r = response as Record<string, unknown>;

  if (!r.hits || !Array.isArray(r.hits)) {
    throw new Error('Invalid Pixabay response: missing hits array');
  }

  if (r.hits.length === 0) {
    throw new Error('No images found');
  }

  const firstHit = r.hits[0] as Record<string, unknown>;

  if (typeof firstHit.webformatURL !== 'string') {
    throw new Error('Invalid Pixabay response: missing webformatURL');
  }

  return firstHit.webformatURL;
}

/**
 * Validates Pixabay response structure
 */
export function isValidPixabayResponse(response: unknown): response is PixabayResponse {
  if (!response || typeof response !== 'object') return false;

  const r = response as Record<string, unknown>;

  if (!Array.isArray(r.hits)) return false;

  // Empty hits array is valid (just no results)
  if (r.hits.length === 0) return true;

  const firstHit = r.hits[0] as Record<string, unknown>;
  return typeof firstHit.webformatURL === 'string';
}

/**
 * Parses JSON safely, returning null on failure
 */
export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
