# 🔑 Quick API Key Setup

## Where to Put Your Anthropic API Key

### 1️⃣ Get Your API Key

Visit: [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

Click "Create Key" and copy your API key (starts with `sk-ant-...`)

---

### 2️⃣ Add to `.env.local`

Open the `.env.local` file in your project root and find this line:

```bash
ANTHROPIC_API_KEY=your_claude_api_key_here
```

Replace `your_claude_api_key_here` with your actual API key:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save the file.**

---

### 3️⃣ Restart Your Dev Server

```bash
# Stop the server (Ctrl+C or Cmd+C)
# Then restart:
npm run dev
```

---

### 4️⃣ Test It Works

1. Open [http://localhost:3000](http://localhost:3000)
2. Go to the "Communicate" page
3. Click the "Regenerate Options" button (🔄)
4. You should see new AI-generated word predictions with images!

---

## ✅ That's It!

Your app now uses **Claude Haiku** for intelligent word predictions.

### What You Get

- 🤖 **Smart predictions** based on context, time of day, and recent words
- 🖼️ **Auto-matched images** from your wordimages folder
- ⚡ **Auto-refresh** after every 3 word selections
- 💰 **Affordable**: ~$0.001 per prediction

---

## 🐛 Troubleshooting

**See error banner?** Check:
1. ✅ API key is correct in `.env.local`
2. ✅ Dev server was restarted
3. ✅ No extra spaces or quotes around the key
4. ✅ API key starts with `sk-ant-`

**Still stuck?** See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed help.

---

## 📊 Where Images Come From

### Priority Order:

1. **Local wordimages** (`/public/wordimages/` - 60 PNGs)
   - happy, sad, eat, drink, help, yes, no, etc.
   - ✅ **Free, instant, works offline**

2. **Claude suggests words that have local images**
   - The API knows which images are available
   - Prioritizes words with matching images

3. **Fallback**: Text-only tiles (still fully functional)

---

## 🎨 File Locations

| File | Purpose |
|------|---------|
| `.env.local` | **Put your API key here** |
| `/app/api/predict/route.ts` | Claude API integration (Haiku model) |
| `/lib/symbols/wordimage-mapper.ts` | Maps words to local images |
| `/public/wordimages/` | 60 PNG symbol images |
| `/app/(main)/communicate/page.tsx` | Main communication UI |

---

## 💡 Tips

### Adjust Auto-Prediction Frequency

In [`/app/(main)/communicate/page.tsx`](./app/(main)/communicate/page.tsx):

```typescript
const AUTO_PREDICT_AFTER = 3; // Change this number
```

- `2` = More frequent (more API calls)
- `5` = Less frequent (fewer API calls)
- `0` = Disable auto-refresh (manual only)

### Monitor API Usage

Check console (F12) for logs:
```
🤖 Calling Claude Haiku for predictions...
✅ Claude Haiku responded in 450ms
✅ New predictions loaded from Claude Haiku: 6
```

### Set Spending Limit

Recommended: Set a monthly limit at [Anthropic Console → Billing](https://console.anthropic.com/settings/billing)

---

**Need more help?** See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
