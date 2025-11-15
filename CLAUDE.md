# CLAUDE.md - AAC Eye Tracking Communication App

## Project Overview
An accessible communication application for people with motor disabilities, combining eye-tracking technology with AI-powered word prediction and text-to-speech output.

## Core Features
- **Eye Tracking Calibration**: Browser-based webcam eye tracking using WebGazer.js
- **Smart Predictions**: LLM-powered next-word/phrase suggestions displayed as selectable tiles
- **Gaze Selection**: Dwell-time based tile selection through eye tracking
- **Live Speech Output**: Text-to-speech using ElevenLabs API
- **Dual Input Modes**: Eye tracking OR keyboard input
- **Optional Accounts**: Guest mode or registered users with saved phrase banks

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Eye Tracking**: WebGazer.js
- **State Management**: React hooks + Context API (or Zustand for complex state)

### Backend/APIs
- **API Routes**: Next.js API routes
- **LLM Integration**: Claude API (Anthropic) or OpenAI GPT-4
- **Text-to-Speech**: ElevenLabs API (primary), Web Speech API (fallback)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

### Infrastructure
- **Hosting**: Vercel
- **Environment Variables**: .env.local for API keys

## Project Structure
```
aac-communication-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   │   ├── calibrate/          # Eye tracking calibration
│   │   ├── communicate/        # Main communication interface
│   │   └── settings/           # User preferences
│   ├── api/
│   │   ├── predict/            # LLM prediction endpoint
│   │   ├── tts/                # Text-to-speech endpoint
│   │   └── phrases/            # Phrase bank CRUD
│   ├── layout.tsx
│   └── page.tsx                # Landing/mode selection
├── components/
│   ├── calibration/
│   │   ├── CalibrationDots.tsx
│   │   └── CalibrationProgress.tsx
│   ├── communication/
│   │   ├── PredictionTiles.tsx
│   │   ├── TextDisplay.tsx
│   │   ├── GazeIndicator.tsx
│   │   └── ControlButtons.tsx
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
│   │   └── prediction-service.ts
│   ├── tts/
│   │   ├── elevenlabs.ts
│   │   └── web-speech.ts
│   └── supabase/
│       ├── client.ts
│       └── queries.ts
├── types/
│   ├── eye-tracking.ts
│   ├── communication.ts
│   └── user.ts
└── public/
    └── calibration-sounds/      # Audio feedback for calibration
```

## Database Schema (Supabase)

```sql
-- Users table (handled by Supabase Auth)

-- User settings
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dwell_time INTEGER DEFAULT 1000, -- milliseconds
  tile_size VARCHAR(10) DEFAULT 'medium', -- small, medium, large
  prediction_count INTEGER DEFAULT 4,
  voice_id VARCHAR(100), -- ElevenLabs voice ID
  high_contrast BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Phrase banks
CREATE TABLE phrase_banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50), -- greetings, needs, emotions, custom
  phrase TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Communication history (optional, privacy-sensitive)
CREATE TABLE communication_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_phrase_banks_user ON phrase_banks(user_id);
CREATE INDEX idx_phrase_banks_category ON phrase_banks(category);
```

## Key Implementation Details

### Eye Tracking Flow
1. **Calibration** (`/calibrate`):
   - Display 9-point calibration grid
   - User gazes at each point for 2 seconds
   - WebGazer.js builds prediction model
   - Save calibration data to localStorage
   - Accuracy test before proceeding

2. **Gaze Detection**:
   - Continuous gaze coordinate tracking
   - Ray-cast to determine which tile is being looked at
   - Dwell timer starts when gaze enters tile boundary
   - Visual feedback (progress ring) during dwell
   - Selection triggered when dwell time threshold met

### Prediction System
```typescript
// API Route: /api/predict
POST /api/predict
{
  "context": "I want to go", // Current text
  "history": ["Hello", "How are you"], // Recent messages
  "userId": "optional-uuid" // For personalized predictions
}

Response:
{
  "predictions": [
    { "text": "to the park", "confidence": 0.9 },
    { "text": "home", "confidence": 0.85 },
    { "text": "outside", "confidence": 0.8 },
    { "text": "for a walk", "confidence": 0.75 }
  ]
}
```

### Text-to-Speech
```typescript
// Primary: ElevenLabs
POST https://api.elevenlabs.io/v1/text-to-speech/{voice-id}
{
  "text": "Hello world",
  "model_id": "eleven_monolingual_v1"
}

// Fallback: Web Speech API
const utterance = new SpeechSynthesisUtterance(text);
window.speechSynthesis.speak(utterance);
```

## User Flows

### Guest Mode
1. Landing page → Choose input mode
2. If eye tracking: calibration flow
3. Main communication interface
4. Use predictions, build sentences, speak
5. Optional: prompt to create account to save phrases

### Registered User
1. Login/signup
2. Load saved settings and phrase banks
3. Choose input mode (skip calibration if data exists)
4. Communication interface with personalized predictions
5. Access to phrase bank management

## Accessibility Considerations

### Must-Haves
- High contrast mode
- Adjustable tile sizes (touch targets min 44x44px)
- Keyboard navigation for all features
- ARIA labels and semantic HTML
- Screen reader compatibility (for caregivers/setup)
- Focus indicators
- Error states with clear messaging

### Settings to Expose
- Dwell time (500ms - 2500ms)
- Number of prediction tiles (2-6)
- Tile size and spacing
- Text size
- Color schemes
- Audio feedback on/off
- Calibration sensitivity

## Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_claude_api_key
ELEVENLABS_API_KEY=your_elevenlabs_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Phases

### Phase 1: MVP (2-3 weeks)
- [ ] Basic Next.js setup with Tailwind
- [ ] Eye tracking calibration (9-point)
- [ ] Simple gaze detection and dwell selection
- [ ] Text input display
- [ ] LLM prediction API (Claude/GPT-4)
- [ ] 4 prediction tiles
- [ ] Basic text-to-speech (Web Speech API)
- [ ] Keyboard input mode
- [ ] Guest mode only

### Phase 2: Core Features (2-3 weeks)
- [ ] Supabase integration
- [ ] User authentication
- [ ] Phrase bank CRUD
- [ ] ElevenLabs TTS integration
- [ ] Settings page (dwell time, tile size)
- [ ] Visual feedback (progress rings, highlights)
- [ ] Undo/clear functionality
- [ ] Save calibration data

### Phase 3: Polish & Accessibility (2 weeks)
- [ ] High contrast mode
- [ ] Comprehensive keyboard navigation
- [ ] ARIA labels and screen reader testing
- [ ] Personalized predictions (user history)
- [ ] Conversation history
- [ ] Multiple voice options
- [ ] Export conversation log
- [ ] Performance optimization

### Phase 4: Advanced Features (Future)
- [ ] Offline support (PWA)
- [ ] Multi-language support
- [ ] Symbol/picture support
- [ ] Head tracking as alternative input
- [ ] Mobile app (React Native)
- [ ] Caregiver dashboard
- [ ] Voice banking (custom TTS voice)

## Testing Strategy

### Unit Tests
- Eye tracking utilities
- LLM prediction parsing
- TTS service
- Database queries

### Integration Tests
- API routes
- Auth flows
- Phrase bank operations

### E2E Tests (Playwright)
- Complete calibration flow
- Tile selection and text building
- Guest to registered user conversion
- Settings persistence

### Accessibility Testing
- Manual testing with NVDA/JAWS
- Keyboard-only navigation
- axe DevTools automated scans
- Color contrast verification
- User testing with target audience

## Performance Targets
- LLM prediction response: <500ms
- TTS audio playback start: <200ms
- Eye tracking frame rate: 30+ FPS
- Calibration accuracy: >85%
- First contentful paint: <1.5s

## Privacy & Security
- All communication data encrypted at rest
- Optional: zero-knowledge architecture (client-side encryption)
- Clear data retention policies
- GDPR/HIPAA considerations for medical contexts
- No tracking or analytics without explicit consent
- User can delete all data

## Deployment Checklist
- [ ] Environment variables configured
- [ ] Supabase database migrations run
- [ ] Row Level Security policies enabled
- [ ] API rate limiting implemented
- [ ] Error logging (Sentry or similar)
- [ ] Health check endpoint
- [ ] Terms of service and privacy policy
- [ ] Accessibility statement
- [ ] User documentation/tutorial

## Resources & Links
- [WebGazer.js Documentation](https://webgazer.cs.brown.edu/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [ElevenLabs API Docs](https://docs.elevenlabs.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [AAC Community Resources](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/)

## Contributing
When contributing to AAC features:
1. Test with keyboard-only navigation
2. Verify screen reader compatibility
3. Maintain high contrast ratios (4.5:1 minimum)
4. Consider cognitive load and simplicity
5. Get feedback from AAC users when possible

## License
[Choose appropriate license - consider open source for maximum impact]

---

**Note**: This is assistive technology that can significantly impact users' quality of life. Prioritize reliability, accessibility, and privacy above all else. Test extensively with real users who have disabilities.
