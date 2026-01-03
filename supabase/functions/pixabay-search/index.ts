const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PixabaySearchRequest {
  query: string;
  imageType?: string;
  orientation?: string;
  perPage?: number;
  safesearch?: boolean;
  minWidth?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      query,
      imageType = 'photo',
      orientation = 'horizontal',
      perPage = 3,
      safesearch = true,
      minWidth = 800
    }: PixabaySearchRequest = await req.json();

    const pixabayApiKey = Deno.env.get('PIXABAY_API_KEY');

    if (!pixabayApiKey) {
      throw new Error('PIXABAY_API_KEY not configured');
    }

    if (!query) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Missing required parameter: query', code: 'MISSING_PARAMS' }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Build URL with query parameters
    const url = new URL('https://pixabay.com/api/');
    url.searchParams.set('key', pixabayApiKey);
    url.searchParams.set('q', query);
    url.searchParams.set('image_type', imageType);
    url.searchParams.set('orientation', orientation);
    url.searchParams.set('per_page', perPage.toString());
    url.searchParams.set('safesearch', safesearch.toString());
    url.searchParams.set('min_width', minWidth.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pixabay API Error:', errorText);
      throw {
        status: response.status,
        message: `Pixabay API request failed with status ${response.status}`
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
    console.error('Pixabay Search Error:', error);

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
        errorMessage = 'Pixabay service temporarily unavailable';
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
