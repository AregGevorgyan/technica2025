# 🚀 Setup Guide - Adaptive AAC with Claude AI Integration

## Overview

This guide will help you integrate Claude AI (Haiku model) for intelligent word predictions and set up the wordimages system for visual communication.

---

## 📋 Quick Start (Minimal Setup)

To get the AI predictions working, you **only need**:

1. **Anthropic API Key** - For Claude Haiku predictions

The app will work with:
- ✅ Local wordimages (60 pre-loaded symbols)
- ✅ Browser's built-in text-to-speech
- ✅ Eye tracking with EyeGesturesLite
- ✅ All communication features

---

## 🔑 Step 1: Get Your Anthropic API Key

### Option A: If You Already Have an Anthropic Account

1. Go to [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Click **"Create Key"**
3. Give it a name (e.g., "AAC App")
4. Copy the API key (starts with `sk-ant-...`)
5. **⚠️ Save it immediately** - you won't be able to see it again!

### Option B: Create a New Anthropic Account

1. Visit [https://console.anthropic.com/](https://console.anthropic.com/)
2. Click **"Sign Up"**
3. Verify your email
4. Add payment method (Claude API is pay-as-you-go)
5. Navigate to [API Keys](https://console.anthropic.com/settings/keys)
6. Click **"Create Key"**
7. Copy your API key

### Pricing Information

- **Claude Haiku** (what this app uses): **$0.25 per million input tokens**, **$1.25 per million output tokens**
- **Typical usage**: ~500 tokens per prediction request
- **Estimated cost**: ~$0.001 per prediction (very affordable!)
- **Free tier**: Anthropic offers $5 in free credits for new accounts

---

## 🔧 Step 2: Configure Your API Key

### Add API Key to `.env.local`

1. Open the `.env.local` file in the project root
2. Find this line:
   ```bash
   ANTHROPIC_API_KEY=your_claude_api_key_here
   ```
3. Replace `your_claude_api_key_here` with your actual API key:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **Save the file**

### Verify Your Setup

1. Make sure your `.env.local` looks like this:
   ```bash
   # Required for AI predictions
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # Optional (can leave as placeholders for now)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   # ... other optional keys
   ```

2. **Restart your dev server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

---

## ✅ Step 3: Test AI Predictions

1. Open the app in your browser: [http://localhost:3000](http://localhost:3000)
2. Navigate to the **Communicate** page
3. Click the **"Regenerate Options"** button (🔄 icon at bottom)
4. Watch the console for:
   ```
   🤖 Calling Claude Haiku for predictions...
   ✅ Claude Haiku responded in 450ms
   ✅ New predictions loaded from Claude Haiku: 6
   ```
5. You should see new word tiles with images!

### If You See an Error

**Yellow banner appears**: "API key not configured"
- ✅ Check that your `.env.local` file has the correct API key
- ✅ Make sure you restarted the dev server
- ✅ Verify the API key starts with `sk-ant-`
- ✅ Check [Anthropic Console](https://console.anthropic.com/settings/keys) to verify the key is active

---

## 🖼️ Wordimages Integration

### What Are Wordimages?

The app includes **60 pre-loaded PNG symbol images** for common AAC vocabulary:

- **Emotions**: happy, sad, angry, excited, scared, etc.
- **Actions**: eat, drink, help, go, stop, read, etc.
- **Pronouns**: I, you, he, she, they, etc.
- **Social**: hi, bye, yes, no, love, etc.
- **Needs**: food, phone, home, hospital, etc.
- **Animals**: cat, dog, bird, pet, etc.

### How It Works

1. **Automatic Matching**: When Claude Haiku generates word predictions, the app automatically checks if a matching wordimage exists
2. **Priority Order**:
   - First: Check local wordimages folder (`/public/wordimages/`)
   - If not found: Would use external image APIs (if configured)
   - Fallback: Text-only tile
3. **Smart Mapping**: The system maps variations to the same image:
   - "I" or "me" → `I-Me.png`
   - "hello" or "hi" → `Hi.png`
   - "no idea" → `No-Idea.png`

### Available Wordimages

See the complete list in [`/public/wordimages/`](./public/wordimages/):

```
A.png, ADHD.png, Angry.png, Anxiety.png, Autism.png, Bird.png,
Bored.png, Bye.png, Cat.png, Close.png, Craft.png, Disgusted.png,
Dog.png, Down.png, Drink.png, Eat.png, Excited.png, Exercise.png,
Family.png, Far.png, Food.png, Gay.png, Go.png, Group.png, Happy.png,
He-Him.png, Help.png, Hi.png, Home.png, Hospital.png, Hurt.png,
I-Me.png, Left.png, Love.png, No-Idea.png, No.png, Pet.png, Phone.png,
Plant.png, Read.png, Right.png, Sad.png, Scared.png, She-Her.png,
Shocked.png, Stop.png, Technica.png, They-Them.png, Tired.png, To.png,
Treat.png, Tree.png, Up.png, Upset.png, Want.png, What-Way.png,
What.png, Yes.png, Yippie.png, You.png
```

### Claude Prioritizes Local Images

The API prompt includes a hint about available wordimages, so Claude Haiku will **preferentially suggest words that have local images** for better visual communication.

---

## 🤖 How AI Predictions Work

### Automatic Prediction Triggers

The app automatically fetches new predictions:

1. **When you click "Regenerate"** (🔄 button)
2. **After every 3 word selections** (auto-refresh)
3. **When switching categories** (optional)

### Context-Aware Predictions

Claude Haiku considers:

- ✅ **Time of day**: Morning → "coffee", "breakfast" / Evening → "tired", "bed"
- ✅ **Recent selections**: If you picked "I want", next suggestions might be "eat", "drink", "help"
- ✅ **Current composed text**: Suggests words that complete the sentence
- ✅ **User memories**: (requires Supabase setup - optional for now)
- ✅ **Selected category**: If browsing "Feelings", shows emotion words

### Example Prediction Flow

```
User selects: "I" → "want" → "to"
[3 selections made - auto-trigger prediction]

🤖 Claude Haiku receives context:
- Recent messages: ["I", "want", "to"]
- Time: afternoon
- Available images: eat, drink, go, help, read...

✅ Claude suggests: "eat", "drink", "go", "help", "read", "sleep"
   (with matching wordimages automatically attached)
```

---

## 📊 Monitoring Predictions

### Browser Console Logs

Open Developer Tools (F12) and watch the Console:

```javascript
// When regenerating
🔄 User clicked Regenerate - fetching new predictions...
🤖 Calling Claude Haiku for predictions...
✅ Claude Haiku responded in 412ms
✅ New predictions loaded from Claude Haiku: 6

// Auto-trigger after 3 selections
🤖 Auto-triggering prediction after 3 selections
✅ New predictions loaded from Claude Haiku: 6

// Selection tracking
Tile selected via eye tracking or click: want
Tile selected via eye tracking or click: eat
Tile selected via eye tracking or click: help
```

### Footer Status Bar

At the bottom of the communicate page, you'll see:

```
• 3 selections made (predictions updated!)
• 6 selections made (predictions updated!)
```

This confirms the auto-prediction system is working.

---

## 🎨 Customization

### Adjust Auto-Prediction Frequency

In [`/app/(main)/communicate/page.tsx`](./app/(main)/communicate/page.tsx), find:

```typescript
const AUTO_PREDICT_AFTER = 3; // Trigger prediction after every 3 selections
```

Change to your preference:
- `2` = More frequent updates (more API calls, higher cost)
- `5` = Less frequent updates (fewer API calls, lower cost)
- `0` = Disable auto-predictions (manual only via Regenerate button)

### Change Claude Model

In [`/app/api/predict/route.ts`](./app/api/predict/route.ts), find:

```typescript
model: 'claude-3-haiku-20240307', // ✅ Using Haiku model
```

You can change to:
- `claude-3-haiku-20240307` - **Fastest, cheapest** (recommended)
- `claude-3-5-sonnet-20241022` - Smarter, but more expensive
- `claude-3-opus-20240229` - Most capable, most expensive

**Note**: Haiku is perfect for this use case! It's fast, accurate, and cost-effective.

---

## 🔒 Security Best Practices

### Protect Your API Key

1. ✅ **Never commit `.env.local` to Git**
   - Already in `.gitignore`
   - Contains sensitive API keys

2. ✅ **Don't share your API key publicly**
   - If exposed, regenerate it immediately at [Anthropic Console](https://console.anthropic.com/settings/keys)

3. ✅ **Set usage limits** (recommended)
   - Go to [Anthropic Console → Settings → Billing](https://console.anthropic.com/settings/billing)
   - Set monthly spending limit (e.g., $10/month)
   - Receive alerts when approaching limit

---

## 🐛 Troubleshooting

### Problem: "API key not configured" error

**Solution**:
1. Check `.env.local` has your real API key (not placeholder)
2. Restart dev server: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R)

### Problem: "Invalid API key" error

**Solution**:
1. Verify key at [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Check for extra spaces or quotes in `.env.local`
3. Make sure key starts with `sk-ant-`
4. Try regenerating a new API key

### Problem: Predictions are slow

**Solution**:
- ✅ This is normal! Haiku typically responds in 300-800ms
- ✅ Check your internet connection
- ✅ Check [Anthropic Status](https://status.anthropic.com/)

### Problem: Wordimages not showing

**Solution**:
1. Check `/public/wordimages/` folder exists
2. Verify images are PNG format
3. Check browser console for 404 errors
4. Try hard refresh (Ctrl+Shift+R)

### Problem: Auto-predictions not triggering

**Solution**:
1. Check console for selection logs
2. Verify `AUTO_PREDICT_AFTER` is not `0`
3. Make sure you're selecting tiles (not just hovering)

---

## 📈 Optional: Advanced Setup

### Supabase (User Memory Learning)

**Purpose**: Store user interaction history and learned preferences

**Setup**:
1. Create account at [https://supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and keys to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```
4. Run database migrations (see [CLAUDE.md](./CLAUDE.md) for schema)

**Benefits**: AI learns user patterns over time (e.g., "User always asks for coffee in the morning")

### ElevenLabs (High-Quality TTS)

**Purpose**: Premium text-to-speech voices

**Setup**:
1. Get API key from [https://elevenlabs.io/api](https://elevenlabs.io/api)
2. Add to `.env.local`:
   ```bash
   ELEVENLABS_API_KEY=your_key
   ```

**Fallback**: App uses browser's Web Speech API by default (free, built-in)

### External Image APIs (Google/Unsplash)

**Purpose**: Fallback for words without local wordimages

**Setup**: See [`.env.local`](./.env.local) for configuration

**Note**: Not needed! You have 60 wordimages already, which covers most common AAC vocabulary.

---

## 🎉 You're All Set!

Your Adaptive AAC app now has:

✅ **Claude Haiku AI** - Intelligent, context-aware word predictions
✅ **60 Wordimages** - Visual symbols for common AAC vocabulary
✅ **Auto-Predictions** - Updates every 3 selections
✅ **Fast & Affordable** - ~$0.001 per prediction request
✅ **Eye Tracking** - Hands-free communication
✅ **Browser TTS** - Built-in speech output

### Next Steps

1. **Test the app**: Try selecting words and see predictions adapt
2. **Customize**: Adjust auto-prediction frequency to your preference
3. **Add images**: Place more PNGs in `/public/wordimages/` and update the mapper
4. **Setup Supabase**: Enable user memory learning (optional)
5. **Deploy**: Deploy to Vercel for production use

---

## 📞 Support

- **Documentation**: See [CLAUDE.md](./CLAUDE.md) for full project details
- **Issues**: Report bugs at [GitHub Issues](https://github.com/AregGevorgyan/technica2025/issues)
- **Anthropic Docs**: [https://docs.anthropic.com/](https://docs.anthropic.com/)
- **API Status**: [https://status.anthropic.com/](https://status.anthropic.com/)

---

**Made for Technica 2025** 🎓
**Website**: [http://eye-acc.select/](http://eye-acc.select/)
**GitHub**: [https://github.com/AregGevorgyan/technica2025](https://github.com/AregGevorgyan/technica2025)
