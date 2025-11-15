# CLAUDE.md - Adaptive AAC Communication System

## Project Overview
An intelligent, adaptive AAC (Augmentative and Alternative Communication) system that learns from user interactions to provide increasingly personalized communication options. Combines visual symbols, dynamic word prediction, and AI memory to create a communication tool that evolves with the user's needs and preferences.

## Core Features
- **Adaptive Interface**: LLM dynamically adjusts available communication options based on context
- **Visual + Text Communication**: Words paired with relevant images for easier recognition
- **User Memory System**: AI learns user preferences, routines, and communication patterns
- **Smart Predictions**: Context-aware suggestions that improve over time
- **Eye Tracking + Keyboard**: Multiple input methods for accessibility
- **Live Speech Output**: Text-to-speech using ElevenLabs API
- **Symbol-Based Navigation**: Category-based browsing with visual cues

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
│   │   ├── AdaptiveTileGrid.tsx    # Dynamic tile layout
│   │   ├── SymbolTile.tsx          # Image + text tile
│   │   ├── CategoryBrowser.tsx     # Navigate by category
│   │   ├── TextDisplay.tsx
│   │   ├── ContextBar.tsx          # Show current context
│   │   └── QuickPhrases.tsx        # Frequently used phrases
│   ├── memory/
│   │   ├── MemoryTimeline.tsx      # Visual history
│   │   └── MemoryEditor.tsx        # Edit AI memories
│   ├── common/
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   └── eye-tracking/
│       ├── EyeTracker.tsx
│       └── GazeDetector.tsx
├── lib/
│   ├── eye-tracking/
│   │   ├── webgazer-init.ts
│   │   └── gaze-utils.ts
│   ├── llm/
│   │   ├── prediction-service.ts
│   │   ├── memory-service.ts       # Manage user memories
│   │   └── context-builder.ts      # Build prompts with memory
│   ├── images/
│   │   ├── search-service.ts       # Google/Unsplash search
│   │   └── cache-service.ts        # Cache image URLs
│   ├── tts/
│   │   ├── elevenlabs.ts
│   │   └── web-speech.ts
│   └── supabase/
│       ├── client.ts
│       └── queries.ts
├── types/
│   ├── eye-tracking.ts
│   ├── communication.ts
│   ├── memory.ts
│   └── user.ts
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
  dwell_time INTEGER DEFAULT 1000,
  tile_size VARCHAR(10) DEFAULT 'medium',
  prediction_count INTEGER DEFAULT 6,
  voice_id VARCHAR(100),
  high_contrast BOOLEAN DEFAULT false,
  show_images BOOLEAN DEFAULT true,
  image_size VARCHAR(10) DEFAULT 'medium',
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

## Image Integration

### Image Search Strategy
1. **Primary**: Google Custom Search API (Images)
   - Reliable, high-quality images
   - Customizable safe search
   - 100 free queries/day, then paid

2. **Fallback**: Unsplash API
   - Free, high-quality stock photos
   - Good for abstract concepts
   - 50 requests/hour free tier

3. **Cache-First Approach**:
   - Check database cache first
   - If miss, fetch from API and cache
   - Cache expires after 30 days
   - Pre-populate common words on deployment

### Image Selection Logic
```typescript
// /api/images/search
POST /api/images/search
{
  "term": "coffee",
  "userId": "uuid" // For personalization
}

// Backend logic:
// 1. Check cache
// 2. If no cache, search Google/Unsplash
// 3. Select best image (simple, clear, relevant)
// 4. Cache result
// 5. Return URL
```

### Common Word Pre-Caching
Pre-cache images for ~500 most common AAC words on first deployment:
- Basic needs: water, food, bathroom, help, yes, no
- Emotions: happy, sad, angry, tired, hurt
- People: mom, dad, family, friend, doctor
- Activities: eat, drink, sleep, play, watch
- Places: home, hospital, school, outside

## User Flows

### First-Time User Setup
1. **Welcome**: Choose input mode (eye tracking / keyboard)
2. **Calibration**: If eye tracking selected
3. **Introduction**: Brief tutorial of interface
4. **Learning Consent**: "Can the app learn your preferences to help communicate better?"
5. **Basic Info** (optional): Name, common people in life, interests
6. **Start Communicating**: Interface shows general options

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

## Accessibility Considerations

### Visual + Text Design
- **Tile Layout**: Image above, text below
- **Image Clarity**: Simple, high-contrast images
- **Text Size**: Adjustable (default 18px minimum)
- **Color Coding**: Optional category color borders
- **Symbol Support**: Core vocabulary symbols (Boardmaker style)

### Cognitive Accessibility
- **Consistent Layout**: Predictable interface structure
- **Progressive Complexity**: Start simple, add features gradually
- **Clear Feedback**: Visual/audio confirmation of selections
- **Undo Support**: Easy mistake correction
- **Reduced Cognitive Load**: Limit choices to 4-8 tiles at once

### Settings to Expose
- Number of tiles displayed (4, 6, 8, 9)
- Image size (small, medium, large, off)
- Text size
- Category depth (show subcategories or not)
- Prediction aggressiveness (conservative to creative)
- Learning rate (slow, medium, fast)
- Memory review frequency

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
- [ ] Eye tracking calibration
- [ ] Tile-based interface (text + images)
- [ ] Google Custom Search integration
- [ ] Image caching system
- [ ] Category navigation
- [ ] Basic text-to-speech
- [ ] Keyboard input mode
- [ ] Pre-cache common 100 words

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
- [WebGazer.js Documentation](https://webgazer.cs.brown.edu/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase pgvector Guide](https://supabase.com/docs/guides/ai/vector-columns)
- [Google Custom Search API](https://developers.google.com/custom-search/v1/overview)
- [Unsplash API](https://unsplash.com/documentation)
- [ElevenLabs API](https://docs.elevenlabs.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [AAC Research](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/)

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
