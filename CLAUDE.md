# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Idioma-AI is a language learning application built with React, TypeScript, Vite, and Supabase. The app helps users build vocabulary, practice with example sentences, and learn through interactive tools and quizzes.

## Development Commands

```bash
# Start development server (runs on http://localhost:5173/)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Environment Variables

Required environment variables in `.env`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Note**: API keys for OpenAI, DeepL, and Pixabay are stored as Supabase secrets (server-side), NOT in `.env`.

## Supabase Database

**Project**: Idioma-ai (reference ID: `iwalufzzgmhqnjusfibd`)
**Region**: East US (North Virginia)

**Main Tables**:
- `profiles` - User profile information
- `vocabulary` - User vocabulary words with translations and list organization

**Custom RPC Function**:
- `get_distinct_list_names(user_id)` - Returns distinct vocabulary list names for a user

**Edge Functions** (all deployed and active):
- `openai-unified` - Handles OpenAI chat, transcription (Whisper), and vision API calls
- `deepl-translate` - DeepL translation service
- `pixabay-search` - Pixabay image search

**Secrets Management**:
```bash
# View secrets
supabase secrets list

# Set a secret
supabase secrets set SECRET_NAME="value"

# Deploy edge function after secret change
supabase functions deploy function-name
```

To work with Supabase locally:
```bash
# Link to remote project
supabase link --project-ref iwalufzzgmhqnjusfibd

# Pull schema
supabase db pull --schema public

# Deploy edge functions
supabase functions deploy openai-unified
supabase functions deploy deepl-translate
supabase functions deploy pixabay-search
```

## Architecture

### Routing Structure

The app uses `react-router-dom` with a custom Layout component that wraps most pages:

- **Landing page** (`/`) - No layout wrapper, standalone page
- **Main pages** - All use Layout component (Navbar + 3-column grid + LeftColumn sidebar + Footer):
  - `/home` - Home page
  - `/tools` - Tools hub page
  - `/tools/sub1`, `/tools/sub2`, `/tools/sub3` - Tool-specific pages
  - `/teach` - Teaching hub page
  - `/teach/sub1`, `/teach/sub2` - Teaching-specific pages
  - `/saas1`, `/saas2` - SaaS pages (quizzes)
  - `/profile/config` - User profile configuration

**Note**: `src/routes.tsx` exists but is NOT used. Actual routing is defined in `src/App.tsx`.

### Layout Pattern

The Layout component (defined in `App.tsx:30-45`) provides:
- Navbar at top
- 3-column main content area (using Tailwind `md:grid-cols-4`):
  - Left: Main content (3 columns)
  - Right: LeftColumn sidebar component (1 column)
- Footer at bottom

### Key Components

**Vocabulary Management** (`src/pages/tools/Sub2.tsx`):
- Manages vocabulary lists per user
- Features: add/delete words, rename lists, translate words (via DeepL edge function)
- Generates example sentences using OpenAI edge function
- Integrates Chat component for interactive practice

**Reusable Components**:
- `PixabayImage` - Fetches images via Pixabay edge function
- `TranslateWord` - Translation component (currently placeholder)
- `Chat` - Chat interface using OpenAI edge function
- `MenuButton` - Reusable menu button component

**Tool Pages**:
- `Sub1.tsx` - Spanish verb conjugation using OpenAI chat
- `Sub2.tsx` - Vocabulary management with DeepL translation and OpenAI examples
- `Sub3.tsx` - Topic-based vocabulary generation using OpenAI

**Teaching Pages**:
- `TeachSub1.tsx` - Camera/image translation using GPT-4 Vision edge function
- `TeachSub2.tsx` - Audio transcription using Whisper edge function

**SaaS Pages**:
- `Saas1.tsx` - Spanish content summaries and quizzes
- `Saas2.tsx` - Multilingual content (Spanish, French, German, Chinese, Japanese)

### External API Integrations

**IMPORTANT**: All external API calls (OpenAI, DeepL, Pixabay) are routed through Supabase Edge Functions for security. API keys are stored server-side as Supabase secrets.

**Helper Utility**: `src/lib/edgeFunctions.ts`
- `callOpenAI()` - Unified OpenAI function (chat, transcription, vision)
- `translateWithDeepL()` - DeepL translation
- `searchPixabay()` - Pixabay image search
- `invokeEdgeFunction()` - Generic edge function invoker

**APIs Used**:
1. **OpenAI** (via edge function) - Chat, example sentences, Whisper transcription, GPT-4 Vision
2. **DeepL** (via edge function) - Word translation
3. **Pixabay** (via edge function) - Vocabulary images
4. **Google Tag Manager** - Analytics (GTM ID: `GTM-KJTB89TKD`, initialized in `App.tsx`)

**Edge Function Architecture**:
- `openai-unified/index.ts` - Handles 3 operation types:
  - `type: 'chat'` - Chat completions (gpt-4-turbo, gpt-3.5-turbo)
  - `type: 'transcription'` - Whisper audio transcription (requires base64 audio)
  - `type: 'vision'` - GPT-4 Vision for image analysis
- `deepl-translate/index.ts` - POST to DeepL API
- `pixabay-search/index.ts` - GET from Pixabay API

### Authentication Flow

- Uses Supabase Auth (`supabase.auth.getUser()`)
- User ID from auth is matched against `profiles` table
- Most features require authenticated user

## State Management

No global state management library (Redux/Zustand). Uses:
- React `useState` for local component state
- `useEffect` for data fetching
- Props for component communication

## Styling

- **Tailwind CSS** - Primary styling framework
- Custom class: `container-custom` (used in layout)
- Lucide React icons for UI icons

## Important Notes

### Adding New External API Calls
When adding new external API integrations:
1. Create a new edge function in `supabase/functions/`
2. Store API key as Supabase secret: `supabase secrets set API_KEY="value"`
3. Deploy edge function: `supabase functions deploy function-name`
4. Add helper function to `src/lib/edgeFunctions.ts`
5. Use helper function in React components (never call API directly from frontend)

### Backup Files
- `Sub2backup.tsx` and `TeachSub1backup.tsx` exist but are not used in production
- These contain old direct API call patterns (pre-migration)

## Known Issues & TODOs

From `readme.txt`:
- Email verification logic temporarily removed
- Forgot Password feature needs implementation
- reCAPTCHA needs implementation
- Last login timestamp needs to be tracked
- Vocabulary page UI improvements needed (hide controls when list clicked, refresh after save)
- Quiz answer functionality in Saas2.tsx needs fixing
