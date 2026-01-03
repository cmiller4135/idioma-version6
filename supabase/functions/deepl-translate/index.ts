const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface TranslateRequest {
  text: string;
  target_lang: string;
  source_lang?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, target_lang, source_lang }: TranslateRequest = await req.json();
    const deeplApiKey = Deno.env.get('DEEPL_API_KEY');

    if (!deeplApiKey) {
      throw new Error('DEEPL_API_KEY not configured');
    }

    if (!text || !target_lang) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Missing required parameters: text and target_lang', code: 'MISSING_PARAMS' }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Build form data
    const formData = new URLSearchParams();
    formData.append('auth_key', deeplApiKey);
    formData.append('text', text);
    formData.append('target_lang', target_lang);
    if (source_lang) {
      formData.append('source_lang', source_lang);
    }

    const response = await fetch('https://api.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepL API Error:', errorText);
      throw {
        status: response.status,
        message: `DeepL API request failed with status ${response.status}`
      };
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('DeepL Translation Error:', error);

    let statusCode = 500;
    let errorCode = 'UNKNOWN_ERROR';
    let errorMessage = error.message || 'An unexpected error occurred';

    if (error.status) {
      statusCode = error.status;
      if (error.status === 429) {
        errorCode = 'RATE_LIMIT';
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.status === 403 || error.status === 401) {
        errorCode = 'AUTH_ERROR';
        errorMessage = 'Authentication failed';
      } else if (error.status >= 500) {
        errorCode = 'SERVICE_ERROR';
        errorMessage = 'DeepL service temporarily unavailable';
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
