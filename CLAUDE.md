# CLAUDE.md - Adaptive AAC Communication System

## Project Overview
An intelligent, adaptive AAC (Augmentative and Alternative Communication) system that learns from user interactions to provide increasingly personalized communication options. Combines visual symbols, dynamic word prediction, and AI memory to create a communication tool that evolves with the user's needs and preferences.

## Core Features
- **Adaptive Interface**: LLM dynamically adjusts available communication options based on context
- **Visual + Text Communication**: Words paired with relevant images/symbols for easier recognition
- **User Memory System**: AI learns user preferences, routines, and communication patterns
- **Smart Predictions**: Context-aware suggestions that improve over time
- **Multiple Input Methods**: Eye tracking, keyboard, click/touch for accessibility
- **Flexible Speech Output**: Choose between immediate speech or text aggregation modes
- **Text Management**: Copy aggregated text to clipboard for external use
- **Regenerate Options**: Request new suggestions at any time for better choices
- **Symbol-Based Navigation**: Category-based browsing with visual cues from OpenSymbols library

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Eye Tracking**: WebGazer.js
- **State Management**: Zustand (for complex state across memory/context)
- **Image Handling**: Next.js Image optimization

### Backend/APIs
- **API Routes**: Next.js API routes
- **LLM Integration**: Claude API (Anthropic) with extended context
- **Image Search**: Google Custom Search API or Unsplash API
- **Text-to-Speech**: ElevenLabs API (primary), Web Speech API (fallback)
- **Database**: Supabase (PostgreSQL with pgvector for embeddings)
- **Vector Storage**: Supabase pgvector for semantic memory search
- **Caching**: Redis (Upstash) for image URLs and frequent queries

### Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Environment Variables**: .env.local for API keys

## Project Structure
```
adaptive-aac-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   │   ├── calibrate/          # Eye tracking calibration
│   │   ├── communicate/        # Main adaptive interface
│   │   ├── memories/           # View/edit user memories
│   │   └── settings/           # User preferences
│   ├── api/
│   │   ├── predict/            # Context-aware prediction
│   │   ├── memory/             
│   │   │   ├── save/           # Store user interaction
│   │   │   ├── query/          # Retrieve relevant memories
│   │   │   └── update/         # Modify memories
│   │   ├── images/             # Image search and caching
│   │   ├── tts/                # Text-to-speech
│   │   └── adapt/              # Dynamic interface generation
│   ├── layout.tsx
│   └── page.tsx                # Landing/mode selection
├── components/
│   ├── calibration/
│   │   ├── CalibrationDots.tsx
│   │   └── CalibrationProgress.tsx
│   ├── communication/
│   │   ├── AdaptiveTileGrid.tsx       # Dynamic tile layout
│   │   ├── SymbolTile.tsx             # Image/symbol + text tile
│   │   ├── CategoryBrowser.tsx        # Navigate by category
│   │   ├── TextDisplay.tsx            # Aggregated mode text display
│   │   ├── TextDisplayBar.tsx         # Top bar with accumulated text
│   │   ├── SpeakButton.tsx            # Trigger TTS in aggregated mode
│   │   ├── CopyTextButton.tsx         # Copy to clipboard
│   │   ├── RegenerateButton.tsx       # Request new options
│   │   ├── ContextBar.tsx             # Show current context
│   │   └── QuickPhrases.tsx           # Frequently used phrases
│   ├── memory/
│   │   ├── MemoryTimeline.tsx         # Visual history
│   │   └── MemoryEditor.tsx           # Edit AI memories
│   ├── common/
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   └── input/
│       ├── EyeTracker.tsx             # Eye tracking handler
│       ├── GazeDetector.tsx           # Gaze detection logic
│       ├── ClickHandler.tsx           # Click/touch handler
│       └── KeyboardHandler.tsx        # Keyboard navigation
├── lib/
│   ├── input/
│   │   ├── webgazer-init.ts        # Eye tracking setup
│   │   ├── gaze-utils.ts           # Gaze detection helpers
│   │   ├── click-handler.ts        # Click/touch logic
│   │   └── keyboard-handler.ts     # Keyboard navigation
│   ├── llm/
│   │   ├── prediction-service.ts
│   │   ├── memory-service.ts       # Manage user memories
│   │   └── context-builder.ts      # Build prompts with memory
│   ├── symbols/
│   │   ├── opensymbols.ts          # OpenSymbols library integration
│   │   ├── symbol-search.ts        # Search across symbol sets
│   │   └── symbol-cache.ts         # Local symbol caching
│   ├── images/
│   │   ├── search-service.ts       # Google/Unsplash search
│   │   └── cache-service.ts        # Cache image URLs
│   ├── tts/
│   │   ├── elevenlabs.ts
│   │   └── web-speech.ts
│   ├── clipboard/
│   │   └── copy-utils.ts           # Clipboard operations
│   └── supabase/
│       ├── client.ts
│       └── queries.ts
├── types/
│   ├── input.ts                    # Input modes & handlers
│   ├── communication.ts            # Speech modes, tiles
│   ├── memory.ts                   # User memories
│   ├── symbols.ts                  # Symbol/image types
│   └── user.ts                     # User settings & preferences
└── public/
    ├── calibration-sounds/
    └── fallback-symbols/          # Default symbols if images fail
```

## Database Schema (Supabase)

```sql
-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (handled by Supabase Auth)

-- User settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input_mode VARCHAR(20) DEFAULT 'click', -- click, eye_tracking, keyboard
  dwell_time INTEGER DEFAULT 1000, -- For eye tracking
  tile_size VARCHAR(10) DEFAULT 'medium',
  prediction_count INTEGER DEFAULT 6,
  voice_id VARCHAR(100),
  speech_mode VARCHAR(20) DEFAULT 'immediate', -- immediate, aggregated
  high_contrast BOOLEAN DEFAULT false,
  show_images BOOLEAN DEFAULT true,
  image_size VARCHAR(10) DEFAULT 'medium',
  symbol_source VARCHAR(20) DEFAULT 'opensymbols', -- opensymbols, google, unsplash
  learning_enabled BOOLEAN DEFAULT true, -- Allow AI to learn preferences
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User memories (AI's knowledge about the user)
CREATE TABLE user_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type VARCHAR(50), -- preference, routine, relationship, interest, need
  content TEXT NOT NULL, -- Natural language description
  embedding vector(1536), -- For semantic search (OpenAI ada-002 size)
  importance FLOAT DEFAULT 0.5, -- 0-1 score for relevance
  frequency INTEGER DEFAULT 1, -- How often referenced
  last_accessed TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- Flexible storage for additional context
);

-- Communication interactions (for learning)
CREATE TABLE communication_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context JSONB, -- Time of day, location, recent messages
  selected_option TEXT,
  available_options JSONB, -- What was offered
  time_to_select INTEGER, -- Milliseconds
  created_at TIMESTAMP DEFAULT NOW()
);

-- Phrase banks (user's custom phrases)
CREATE TABLE phrase_banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50),
  phrase TEXT NOT NULL,
  image_url TEXT, -- Cached image URL
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Image cache (reduce API calls)
CREATE TABLE image_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_term VARCHAR(200) UNIQUE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  source VARCHAR(50), -- google, unsplash, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Context snapshots (what user was doing when)
CREATE TABLE context_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  time_of_day VARCHAR(20), -- morning, afternoon, evening, night
  day_of_week INTEGER,
  location VARCHAR(100), -- Optional
  activity TEXT, -- What they were communicating about
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_memories_user ON user_memories(user_id);
CREATE INDEX idx_memories_type ON user_memories(memory_type);
CREATE INDEX idx_memories_embedding ON user_memories USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_interactions_user_time ON communication_interactions(user_id, created_at DESC);
CREATE INDEX idx_phrase_banks_user ON phrase_banks(user_id);
CREATE INDEX idx_image_cache_term ON image_cache(search_term);
CREATE INDEX idx_context_user_time ON context_snapshots(user_id, created_at DESC);
```

## AI Memory System

### Memory Types
1. **Preferences**: "User prefers to say 'washroom' instead of 'bathroom'"
2. **Routines**: "User typically asks for lunch around 12:30 PM"
3. **Relationships**: "User's daughter is named Sarah, visits on weekends"
4. **Interests**: "User loves talking about baseball and the Red Sox"
5. **Needs**: "User needs medication reminder at 8 AM and 8 PM"
6. **Communication Patterns**: "User often requests help in the morning"

### Memory Creation Flow
```typescript
// After each interaction
POST /api/memory/save
{
  "userId": "uuid",
  "interaction": {
    "selected": "I want to go outside",
    "context": {
      "timeOfDay": "afternoon",
      "dayOfWeek": 3,
      "recentMessages": ["Hello", "How are you"]
    }
  }
}

// LLM analyzes and extracts learnings
// Examples:
// - "User frequently requests to go outside in afternoons"
// - "User prefers direct communication style"
// - "User is more active in afternoon hours"
```

### Memory Retrieval for Predictions
```typescript
// When generating options
POST /api/predict
{
  "userId": "uuid",
  "currentText": "I want",
  "context": {
    "timeOfDay": "morning",
    "dayOfWeek": 1,
    "location": "home"
  }
}

// Backend:
// 1. Query relevant memories (vector search + filters)
// 2. Build enriched prompt for Claude
// 3. Generate contextually appropriate options with images
```

### Example Prompt to Claude
```
You are an AAC communication assistant. Generate 6 communication options.

USER MEMORIES:
- User's name is Alex
- Prefers "washroom" over "bathroom"
- Has a daughter named Sarah who visits on weekends
- Enjoys coffee in the morning
- Takes medication at 8 AM
- Loves talking about baseball

CURRENT CONTEXT:
- Time: Monday, 8:15 AM
- Recent messages: ["Good morning"]
- Current input: "I want"

USAGE PATTERNS:
- Mornings: often requests coffee, breakfast, medication
- Responds well to images alongside text

Generate 6 options that would be most helpful right now. Return as JSON:
[
  {
    "text": "coffee please",
    "category": "needs",
    "imageSearchTerm": "coffee cup",
    "priority": 0.9
  },
  ...
]
```

## Dynamic Interface Adaptation

### Context-Aware Tile Generation
The interface adapts based on:
- **Time of day**: Morning = breakfast options, evening = bedtime routine
- **Recent communication**: If discussing food, offer more food-related options
- **User history**: Frequently used phrases appear more prominently
- **Learned patterns**: "User always asks for water after medication"

### Category System
```typescript
interface Category {
  id: string;
  name: string;
  icon: string; // emoji or image
  subcategories?: Category[];
  commonPhrases: string[];
}

// Dynamic categories
const categories = {
  needs: ["food", "drink", "bathroom", "help", "rest"],
  feelings: ["happy", "sad", "tired", "pain", "frustrated"],
  people: ["family", "friends", "caregivers"], // Personalized
  activities: ["watch TV", "go outside", "read", "music"],
  social: ["greetings", "questions", "responses"],
  custom: [] // User-created categories
};
```

## Image & Symbol Integration

### Symbol/Image Search Strategy
1. **Primary**: OpenSymbols (https://github.com/open-aac/opensymbols)
   - Free, open-source AAC symbol library
   - Consistent, recognizable symbols designed for communication
   - Multiple symbol sets: Mulberry, ARASAAC, SymbolStix, etc.
   - Local integration, no API limits
   - Best for common AAC vocabulary

2. **Secondary**: Google Custom Search API (Images)
   - Reliable, high-quality images for concepts not in OpenSymbols
   - Customizable safe search
   - 100 free queries/day, then paid

3. **Tertiary**: Unsplash API
   - Free, high-quality stock photos
   - Good for abstract concepts
   - 50 requests/hour free tier

4. **Cache-First Approach**:
   - Check OpenSymbols library first
   - Check database cache for custom/Google/Unsplash images
   - If miss, fetch from API and cache
   - Cache expires after 30 days
   - Pre-populate common AAC words with OpenSymbols on deployment

### Symbol/Image Selection Logic
```typescript
// /api/images/search
POST /api/images/search
{
  "term": "coffee",
  "userId": "uuid", // For personalization
  "preferSymbols": true // User preference for symbols vs photos
}

// Backend logic:
// 1. Check if term exists in OpenSymbols library
// 2. If found, return symbol URL
// 3. If not found or user prefers photos, check cache
// 4. If no cache, search Google/Unsplash
// 5. Select best image (simple, clear, relevant)
// 6. Cache result
// 7. Return URL with metadata (source, type)
```

### OpenSymbols Integration

OpenSymbols provides a comprehensive, free library of AAC symbols. Integration strategy:

1. **Symbol Sets Available**:
   - **Mulberry Symbols**: Simple, modern, colorful (recommended default)
   - **ARASAAC**: Widely-used international symbols
   - **SymbolStix**: Clear, recognizable symbols
   - **Tawasol**: Arabic-language symbols
   - User can choose preferred set in settings

2. **Local Storage**:
   - Download relevant symbol sets during build
   - Store in `public/symbols/` directory
   - Organize by category for fast lookup
   - Total size: ~50-100MB for core vocabulary

3. **Symbol Lookup**:
   ```typescript
   // lib/symbols/opensymbols.ts
   interface SymbolResult {
     symbolUrl: string;
     source: 'mulberry' | 'arasaac' | 'symbolstix';
     license: string;
   }

   async function findSymbol(word: string, preferredSet?: string): Promise<SymbolResult | null> {
     // 1. Check preferred symbol set first
     // 2. Fallback to other sets
     // 3. Return null if not found (trigger image search)
   }
   ```

4. **Attribution**: Display symbol license info in settings/about page

### Common Word Pre-Caching
Pre-load symbols/images for ~500 most common AAC words:
- **Basic needs**: water, food, bathroom, help, yes, no, more, stop
- **Emotions**: happy, sad, angry, tired, hurt, scared, excited
- **People**: mom, dad, family, friend, doctor, nurse, caregiver
- **Activities**: eat, drink, sleep, play, watch, listen, read, go
- **Places**: home, hospital, school, outside, bedroom, kitchen
- **Time**: now, later, today, tomorrow, morning, afternoon, night
- **Questions**: what, where, when, who, why, how

## User Flows

### First-Time User Setup
1. **Welcome**: Choose input mode (click/touch, eye tracking, or keyboard)
2. **Calibration**: If eye tracking selected
3. **Speech Mode Selection**: Choose immediate speech or text aggregation mode
4. **Introduction**: Brief tutorial of interface
5. **Learning Consent**: "Can the app learn your preferences to help communicate better?"
6. **Basic Info** (optional): Name, common people in life, interests
7. **Start Communicating**: Interface shows general options

### Ongoing Adaptation
1. User selects options to communicate
2. System logs interactions with context
3. After ~20 interactions, LLM analyzes patterns
4. Memories are created/updated
5. Interface gradually becomes more personalized
6. User can view/edit memories at any time

### Example Adaptation Timeline
- **Day 1**: Generic AAC interface, basic categories
- **Day 3**: Frequent phrases start appearing in quick access
- **Week 1**: Time-based predictions emerge (coffee in morning)
- **Week 2**: Relationship-aware options (mentions family names)
- **Month 1**: Highly personalized, anticipates needs accurately

## Communication Modes & Input Methods

### Input Methods
Users can select from multiple input methods based on their abilities and preferences:

1. **Click/Touch Mode** (Default)
   - Direct selection via mouse click or touchscreen
   - Fastest and most accessible for users with motor control
   - Visual hover effects for feedback
   - Works on all devices

2. **Eye Tracking Mode**
   - Uses WebGazer.js for gaze detection
   - Dwell time configurable (default: 1000ms)
   - Visual countdown indicator on focused tile
   - Requires calibration before first use
   - Best for users with limited motor control

3. **Keyboard Mode**
   - Number keys (1-9) to select tiles
   - Arrow keys for navigation
   - Enter to confirm selection
   - Escape to go back
   - Full keyboard accessibility

### Speech Output Modes

Users can choose how their selected words are spoken:

#### 1. Immediate Speech Mode
- **Behavior**: Each selected option is spoken immediately upon selection
- **Use Case**: Quick, conversational communication
- **Features**:
  - Instant audio feedback
  - Good for simple requests and responses
  - Mimics natural conversation flow
- **Example Flow**:
  ```
  User selects: "I want" → [spoken immediately]
  User selects: "coffee" → [spoken immediately]
  User selects: "please" → [spoken immediately]
  ```

#### 2. Aggregated/Composed Mode
- **Behavior**: Selected words are collected into a text display for composition
- **Use Case**: Complex sentences, thoughtful communication, written output
- **Features**:
  - **Text Display Bar**: Shows accumulated text at top of interface
  - **Speak Button**: User triggers speech when ready
  - **Copy to Clipboard**: Export text for use in other applications
  - **Edit Controls**:
    - Backspace/delete last word
    - Clear all text
    - Edit individual words
  - **Auto-save**: Text persists if app is closed/refreshed
- **Example Flow**:
  ```
  User selects: "I want" → [added to display]
  User selects: "to go" → [added to display]
  User selects: "outside" → [added to display]
  Text display: "I want to go outside"
  User clicks [Speak] → [full sentence spoken]
  User clicks [Copy] → [text copied to clipboard]
  ```

### Option Regeneration

Users can request new suggestions at any time:

- **Regenerate Button**: Available on main communication interface
- **Behavior**: Requests fresh predictions from LLM with current context
- **Use Cases**:
  - Current options don't match intent
  - Exploring different communication paths
  - User wants more creative/varied suggestions
- **Implementation**:
  ```typescript
  // User clicks "Regenerate Options"
  POST /api/adapt/tiles
  {
    "userId": "uuid",
    "regenerate": true,
    "excludePrevious": ["coffee", "water", "help"], // Don't repeat recent suggestions
    "currentContext": {...}
  }
  ```

## Key Implementation Details

### Adaptive Tile Generation
```typescript
// /api/adapt/tiles
POST /api/adapt/tiles
{
  "userId": "uuid",
  "currentContext": {
    "timeOfDay": "morning",
    "recentMessages": ["Good morning", "How did you sleep"],
    "currentCategory": "needs"
  }
}

Response:
{
  "tiles": [
    {
      "id": "tile-1",
      "text": "coffee please",
      "imageUrl": "https://cached-url/coffee.jpg",
      "category": "needs",
      "priority": 0.95,
      "reasoning": "User typically requests coffee around this time"
    },
    {
      "id": "tile-2", 
      "text": "I slept well",
      "imageUrl": "https://cached-url/sleeping.jpg",
      "category": "response",
      "priority": 0.9,
      "reasoning": "Contextually relevant to recent question"
    },
    // ... 4-6 more tiles
  ],
  "suggestedCategories": ["needs", "feelings", "people"]
}
```

### Memory Privacy Controls
```typescript
interface MemoryPrivacySettings {
  learningEnabled: boolean; // Master switch
  allowedMemoryTypes: string[]; // Which types to store
  retentionDays: number; // Auto-delete old memories
  shareWithCaregivers: boolean; // Optional dashboard
  exportable: boolean; // User can download all memories
}
```

### TypeScript Type Definitions

```typescript
// Input modes
type InputMode = 'click' | 'eye_tracking' | 'keyboard';

// Speech output modes
type SpeechMode = 'immediate' | 'aggregated';

// Symbol/image sources
type SymbolSource = 'opensymbols' | 'google' | 'unsplash' | 'custom';

// Communication tile
interface CommunicationTile {
  id: string;
  text: string;
  symbolUrl?: string;
  imageUrl?: string;
  symbolSource: SymbolSource;
  category: string;
  priority: number;
  reasoning?: string; // Why this was suggested
}

// Composed text state (for aggregated mode)
interface ComposedText {
  segments: TextSegment[];
  fullText: string;
  timestamp: Date;
}

interface TextSegment {
  id: string;
  text: string;
  tileId?: string;
  timestamp: Date;
}

// User preferences
interface UserCommunicationSettings {
  inputMode: InputMode;
  speechMode: SpeechMode;
  symbolSource: SymbolSource;
  dwellTime: number; // milliseconds for eye tracking
  tileCount: 4 | 6 | 8 | 9;
  showRegenerateButton: 'always' | 'when_stuck' | 'never';
  autoClearComposedText: boolean;
  voiceId?: string;
}

// Regenerate request
interface RegenerateRequest {
  userId: string;
  excludePrevious: string[];
  currentContext: CommunicationContext;
  requireDifferentCategories?: boolean;
}

interface CommunicationContext {
  timeOfDay: string;
  dayOfWeek: number;
  recentMessages: string[];
  currentCategory?: string;
  composedText?: string; // Current text in aggregated mode
  location?: string;
}
```

## Accessibility Considerations

### Visual + Text Design
- **Tile Layout**: Symbol/image above, text below
- **Symbol Library**: OpenSymbols as primary source (Mulberry, ARASAAC, etc.)
- **Image Clarity**: Simple, high-contrast symbols and images
- **Text Size**: Adjustable (default 18px minimum)
- **Color Coding**: Optional category color borders
- **Consistency**: Same symbol for same word across sessions
- **Fallback Hierarchy**: OpenSymbols → Google Images → Unsplash → Text-only

### Cognitive Accessibility
- **Consistent Layout**: Predictable interface structure
- **Progressive Complexity**: Start simple, add features gradually
- **Clear Feedback**: Visual/audio confirmation of selections
- **Undo Support**: Easy mistake correction
- **Reduced Cognitive Load**: Limit choices to 4-8 tiles at once

### Settings to Expose
- **Input Method**: Click/touch, eye tracking, keyboard
- **Speech Mode**: Immediate or aggregated
- **Symbol/Image Preference**: OpenSymbols, photos, or mixed
- **Number of tiles displayed**: 4, 6, 8, 9
- **Image/Symbol size**: Small, medium, large, off
- **Text size**: Small, medium, large, extra large
- **Dwell time** (eye tracking): 500ms - 3000ms
- **Category depth**: Show subcategories or not
- **Prediction aggressiveness**: Conservative to creative
- **Learning rate**: Slow, medium, fast
- **Memory review frequency**: Daily, weekly, monthly
- **Auto-clear composed text**: Yes/no (for aggregated mode)
- **Show regenerate button**: Always, when stuck, never

## Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_key # For embeddings

GOOGLE_CUSTOM_SEARCH_API_KEY=your_google_key
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id
UNSPLASH_ACCESS_KEY=your_unsplash_key

ELEVENLABS_API_KEY=your_elevenlabs_key

UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Phases

### Phase 1: Core AAC Interface (2-3 weeks)
- [ ] Basic Next.js setup with Tailwind
- [ ] OpenSymbols integration and local symbol library
- [ ] Click/touch input handler
- [ ] Keyboard input mode with navigation
- [ ] Eye tracking calibration
- [ ] Tile-based interface (text + symbols/images)
- [ ] Immediate speech mode with TTS
- [ ] Aggregated/composed mode with text display bar
- [ ] Speak button for aggregated mode
- [ ] Copy to clipboard functionality
- [ ] Regenerate options button
- [ ] Google Custom Search integration (fallback)
- [ ] Image/symbol caching system
- [ ] Category navigation
- [ ] Pre-cache common 100 AAC words with OpenSymbols

### Phase 2: Memory & Learning (3-4 weeks)
- [ ] Supabase with pgvector setup
- [ ] User authentication
- [ ] Interaction logging
- [ ] Memory creation system (LLM analysis)
- [ ] Memory retrieval (vector search)
- [ ] Context-aware predictions
- [ ] Basic personalization
- [ ] Memory viewer interface

### Phase 3: Adaptive Intelligence (2-3 weeks)
- [ ] Dynamic tile generation API
- [ ] Time-based context awareness
- [ ] Pattern recognition (routines)
- [ ] Relationship mapping
- [ ] Interest tracking
- [ ] Phrase bank with learned phrases
- [ ] Quick access to frequent phrases
- [ ] Memory importance scoring

### Phase 4: Polish & Advanced Features (2-3 weeks)
- [ ] Memory privacy controls
- [ ] Memory editing/deletion
- [ ] Export user data
- [ ] Caregiver dashboard (optional)
- [ ] Multi-language support
- [ ] Symbol library integration
- [ ] Offline mode (PWA)
- [ ] Voice customization
- [ ] Usage analytics for user

### Phase 5: Optimization (Ongoing)
- [ ] Performance optimization
- [ ] Image loading optimization
- [ ] LLM response caching
- [ ] A/B testing predictions
- [ ] User feedback loop
- [ ] Accessibility audit
- [ ] Real user testing

## Testing Strategy

### Memory System Testing
```typescript
// Test memory creation
describe('Memory Service', () => {
  it('should extract patterns from interactions', async () => {
    const interactions = [
      { selected: 'coffee', context: { timeOfDay: 'morning' } },
      { selected: 'coffee', context: { timeOfDay: 'morning' } },
      { selected: 'coffee', context: { timeOfDay: 'morning' } }
    ];
    
    const memory = await analyzeInteractions(interactions);
    expect(memory.content).toContain('coffee in the morning');
    expect(memory.type).toBe('routine');
  });
});
```

### Adaptation Quality Testing
- Measure prediction accuracy over time
- A/B test different memory retrieval strategies
- Track time-to-selection improvements
- User satisfaction surveys

### Privacy Testing
- Verify memory encryption
- Test data deletion flows
- Confirm no PII in logs
- Validate RLS policies

## Privacy & Ethics

### Data Handling
- **Informed Consent**: Clear explanation of what's learned and why
- **Transparency**: Users can view all memories at any time
- **Control**: Users can edit or delete any memory
- **Minimal Data**: Only store what's necessary for personalization
- **Encryption**: All memories encrypted at rest
- **No Selling**: Data never shared or sold
- **Right to Forget**: Complete data deletion on request

### Ethical Considerations
- **Agency**: User always has final say on communication
- **Non-Manipulation**: AI suggests, never forces
- **Dignity**: Respectful, age-appropriate suggestions
- **Accuracy**: Regular review to prevent incorrect assumptions
- **Bias Awareness**: Monitor for demographic biases in predictions
- **Caregiver Boundaries**: Clear limits on caregiver access

## Performance Targets
- Image load time: <200ms (cached), <1s (fresh)
- LLM prediction: <500ms
- Memory query: <100ms
- TTS latency: <200ms
- Tile interaction response: <50ms
- Eye tracking frame rate: 30+ FPS

## Example User Journey

**Meet Sarah** (fictional user with limited speech due to ALS):

**Week 1**:
- Sarah starts using the app with generic categories
- She often selects "water", "help", and "thank you"
- The app logs her patterns

**Week 2**:
- App notices Sarah requests water frequently in afternoons
- "Water" tile now appears automatically in afternoon
- App learns Sarah's husband is named Tom

**Month 1**:
- Sarah's interface is highly personalized
- Morning tiles: "coffee", "medication time", "good morning"
- Evening tiles: "tired", "ready for bed", "love you" (for Tom)
- App suggests "Let's watch Jeopardy" at 7 PM (learned routine)

**Month 3**:
- Sarah's daughter visits on weekends
- App surfaces "How is Emma?" and "tell Emma I love her" on Saturdays
- Communication speed has improved 40% due to better predictions
- Sarah reviews her memories weekly and enjoys seeing what the app has learned

## Resources & Links
- [OpenSymbols Library](https://github.com/open-aac/opensymbols) - Open-source AAC symbol sets
- [WebGazer.js Documentation](https://webgazer.cs.brown.edu/) - Eye tracking library
- [Next.js Documentation](https://nextjs.org/docs) - React framework
- [Supabase pgvector Guide](https://supabase.com/docs/guides/ai/vector-columns) - Vector database
- [Google Custom Search API](https://developers.google.com/custom-search/v1/overview) - Image search
- [Unsplash API](https://unsplash.com/documentation) - Photo library
- [ElevenLabs API](https://docs.elevenlabs.io/) - Text-to-speech
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- [AAC Research](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/) - Clinical guidelines
- [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) - Browser clipboard access

## Contributing
When developing memory/learning features:
1. Privacy-first design always
2. Transparent AI behavior
3. User control over all learned data
4. Test for bias and fairness
5. Get feedback from AAC users and caregivers
6. Document all memory types and their purpose

## License
[Consider open source with privacy-focused licensing]

---

**Note**: This system holds intimate knowledge about users' lives. Treat this data with the utmost respect and security. Every design decision should prioritize user dignity, privacy, and agency.
