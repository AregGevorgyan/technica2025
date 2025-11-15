# Quick Start Guide - Adaptive AAC

## What's Been Built

This is a **Phase 1** implementation of the Adaptive AAC system with:

### ✅ Completed Features

1. **Core Communication Interface**
   - Tile-based communication grid (4, 6, 8, or 9 tiles)
   - Symbol/image + text display
   - Two speech modes: Immediate and Compose

2. **Compose Mode Features**
   - Text display bar showing accumulated words
   - Speak button (uses browser Web Speech API)
   - Copy to clipboard functionality
   - Backspace and clear controls

3. **Adaptive Intelligence (API Ready)**
   - Claude AI integration for predictions
   - Memory system for learning user patterns
   - Context-aware tile generation
   - Interaction logging

4. **Database Schema**
   - Supabase setup with pgvector
   - User settings, memories, interactions tables
   - Image cache for performance

5. **UI Components**
   - Landing page with navigation
   - Category browser
   - Regenerate button for new suggestions
   - Responsive, accessible design

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional for Demo)

The app will run without API keys using placeholder data. To enable full functionality:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys:
- **Required for AI features**: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- **Required for database**: Supabase credentials
- **Optional**: ElevenLabs, Google, Unsplash keys

### 3. Set Up Database (Optional)

If you want memory/learning features:

1. Create a Supabase project at https://supabase.com
2. Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor
3. Add Supabase credentials to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 5. Try It Out!

1. Click "Start Communicating" on the home page
2. Toggle between "Immediate" and "Compose" modes
3. Click tiles to select words
4. In Compose mode:
   - Build a sentence
   - Click "Speak" to hear it
   - Click "Copy" to copy to clipboard
5. Click "New Options" to regenerate suggestions

## Current Demo Features

### Without API Keys
- ✅ Basic tile interface works
- ✅ Click/touch selection
- ✅ Text composition
- ✅ Web Speech API (browser TTS)
- ✅ Copy to clipboard
- ❌ AI-powered predictions (uses mock data)
- ❌ Memory learning (no database)

### With Full Setup
- ✅ All of the above
- ✅ AI-generated context-aware suggestions
- ✅ Learning from interactions
- ✅ Personalized communication options
- ✅ Image search for tiles
- ✅ High-quality TTS (ElevenLabs)

## Project Structure

```
technica2025/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── (main)/communicate/         # Main communication interface
│   └── api/
│       ├── predict/                # AI predictions
│       ├── memory/                 # Learning system
│       ├── images/                 # Image search
│       └── tts/                    # Text-to-speech
├── components/
│   └── communication/              # UI components
├── lib/
│   └── supabase/                   # Database utilities
├── types/                          # TypeScript definitions
└── supabase-schema.sql             # Database schema
```

## Next Steps (Phase 2+)

To continue development, implement:

1. **Memory Viewer UI** (`/memories` page)
   - Display learned patterns
   - Edit/delete memories
   - Privacy controls

2. **Eye Tracking** (`/calibrate` page)
   - WebGazer.js integration
   - Calibration UI
   - Gaze-based selection

3. **Keyboard Navigation**
   - Number key selection
   - Arrow key navigation

4. **Settings Page** (`/settings`)
   - User preferences
   - Customization options

5. **OpenSymbols Integration**
   - Download symbol library
   - Symbol search and caching
   - Fallback to images

## Development Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit

# Lint
npm run lint
```

## Architecture Decisions

### Why Tailwind v4?
- Installed latest version which has new PostCSS plugin
- Uses `@import "tailwindcss"` syntax

### Why Placeholder API Keys?
- Allows build without real credentials
- Good for demo/testing
- Replace with real keys for production

### Why Web Speech API Default?
- Works immediately, no API key needed
- Good fallback for testing
- ElevenLabs provides higher quality when configured

## Troubleshooting

### Build fails with Tailwind errors
- Make sure `@tailwindcss/postcss` is installed
- Check `postcss.config.mjs` uses `@tailwindcss/postcss`

### Speech doesn't work
- Check browser compatibility (Chrome, Edge, Safari)
- Some browsers require HTTPS for Web Speech API

### Images not loading
- Add image API keys to `.env.local`
- Or use placeholder mode (current default)

## Contributing

See [CLAUDE.md](CLAUDE.md) for full project specification and roadmap.

## License

MIT - see [LICENSE](LICENSE)
