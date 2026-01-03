import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatRequest {
  type: 'chat';
  model: 'gpt-4-turbo' | 'gpt-3.5-turbo';
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string | any;
  }>;
  max_tokens?: number;
  temperature?: number;
}

interface TranscriptionRequest {
  type: 'transcription';
  audioBase64: string;
  filename: string;
}

interface VisionRequest {
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

type OpenAIRequest = ChatRequest | TranscriptionRequest | VisionRequest;

async function handleChat(request: ChatRequest, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens || 3000,
      temperature: request.temperature !== undefined ? request.temperature : 0.4,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw {
      status: response.status,
      message: errorData?.error?.message || `OpenAI API request failed with status ${response.status}`,
    };
  }

  return await response.json();
}

async function handleTranscription(request: TranscriptionRequest, apiKey: string) {
  // Convert base64 to blob
  const binaryString = atob(request.audioBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const audioBlob = new Blob([bytes], { type: 'audio/wav' });

  // Create form data
  const formData = new FormData();
  formData.append('file', audioBlob, request.filename);
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw {
      status: response.status,
      message: errorData?.error?.message || `Whisper API request failed with status ${response.status}`,
    };
  }

  return await response.json();
}

async function handleVision(request: VisionRequest, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      max_tokens: request.max_tokens || 4090,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw {
      status: response.status,
      message: errorData?.error?.message || `Vision API request failed with status ${response.status}`,
    };
  }

  return await response.json();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const request: OpenAIRequest = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    let data;

    // Route based on operation type
    switch (request.type) {
      case 'chat':
        data = await handleChat(request, openaiApiKey);
        break;
      case 'transcription':
        data = await handleTranscription(request, openaiApiKey);
        break;
      case 'vision':
        data = await handleVision(request, openaiApiKey);
        break;
      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: { message: 'Invalid operation type', code: 'INVALID_TYPE' }
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('OpenAI API Error:', error);

    let statusCode = 500;
    let errorCode = 'UNKNOWN_ERROR';
    let errorMessage = error.message || 'An unexpected error occurred';

    if (error.status) {
      statusCode = error.status;
      errorMessage = error.message;

      if (error.status === 429) {
        errorCode = 'RATE_LIMIT';
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.status === 401) {
        errorCode = 'AUTH_ERROR';
        errorMessage = 'Authentication failed';
      } else if (error.status >= 500) {
        errorCode = 'SERVICE_ERROR';
        errorMessage = 'OpenAI service temporarily unavailable';
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: { message: errorMessage, code: errorCode }
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
