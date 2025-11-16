<div align="center">

# 👁️ Eye AAC: Adaptive AAC Eye Tracking System

# Website: [eye-acc.select](http://eye-acc.select/)

### Intelligent, Hands-Free Communication for Enhanced Accessibility

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![WebGazer.js](https://img.shields.io/badge/WebGazer.js-Eye_Tracking-purple?style=for-the-badge)](https://webgazer.cs.brown.edu/)

[Features](#-features) • [Quick Start](#-quick-start) • [Eye Tracking](#-eye-tracking-setup) • [Documentation](#-documentation)

</div>

---

## 🌟 Overview

An **adaptive AAC (Augmentative and Alternative Communication)** system designed for individuals with limited motor control. Using advanced **webcam-based eye tracking**, users can communicate entirely hands-free by simply looking at communication tiles.

Built for **Technica 2025**, this system combines cutting-edge eye tracking technology with an intuitive interface to make communication accessible to everyone.

## ✨ Features

### 🎯 **Eye Tracking Communication**
- **Hands-Free Operation**: Communicate using only your eyes
- **5-Point Calibration**: Quick, streamlined calibration process (~30 seconds)
- **Dwell-Based Selection**: Look at a tile for 1.5 seconds to select it
- **Visual Feedback**: Real-time gaze cursor and progress indicators
- **Smooth Tracking**: Advanced smoothing algorithms for stable, accurate tracking

### 🗣️ **Communication Modes**
- **Immediate Mode**: Speak each word as you select it
- **Compose Mode**: Build complete sentences before speaking
  - Edit and refine your message
  - Copy to clipboard for external use
  - Clear text or backspace functionality

### 🎨 **Responsive Design**
- **Mobile-First**: Works on all screen sizes (320px → 1920px+)
- **Adaptive Layout**: Interface scales to fit any device
- **High Contrast**: Accessibility-focused design
- **Touch & Click**: Alternative input methods always available

### 🔊 **Text-to-Speech**
- **Browser-Based TTS**: Built-in Web Speech API
- **Natural Voices**: Clear, understandable speech output
- **Instant Feedback**: Immediate or composed speech options

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+ and npm
Modern web browser (Chrome recommended)
Webcam for eye tracking
```

### Installation

```bash
# Clone the repository
git clone https://github.com/AregGevorgyan/technica2025.git
cd technica2025

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start communicating!

## 👁️ Eye Tracking Setup

### Step 1: Navigate to Calibration
1. Visit `http://localhost:3000`
2. Click **"Eye Tracking Setup"** button
3. Allow webcam access when prompted

### Step 2: Calibrate Your Gaze
1. **5 calibration points** will appear on screen
2. Look directly at each **red dot**
3. Click **3 times** per dot while looking at it
4. Complete all 5 points (top-left, top-right, center, bottom-left, bottom-right)

### Step 3: Start Communicating
- **Progress bar** shows calibration completion
- After calibration, you'll be redirected automatically
- **Gaze at tiles** for 1.5 seconds to select them
- Blue ring and fill animation show dwell progress

### Tips for Best Results
- 💡 Sit about **2 feet** from the screen
- 💡 Ensure **good lighting** on your face
- 💡 Keep your **head still** during use
- 💡 **Recalibrate** if accuracy degrades

## 📱 Usage

### Communication Interface

**Immediate Mode:**
```
Look at "I want" → Speaks "I want"
Look at "water" → Speaks "water"
Look at "please" → Speaks "please"
```

**Compose Mode:**
```
Look at "I want" → Added to text bar
Look at "water" → Added to text bar
Look at "please" → Added to text bar
Text bar shows: "I want water please"
Look at "Speak" button → Speaks full sentence
```

### Navigation
- **👁️ Icon**: Indicates eye tracking is active
- **Categories**: Browse communication options
- **Regenerate**: Get new tile suggestions
- **Mode Toggle**: Switch between Immediate and Compose

## 🛠️ Tech Stack

<div align="center">

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5.0 |
| **Styling** | Tailwind CSS 4.0 |
| **Eye Tracking** | WebGazer.js |
| **Text-to-Speech** | Web Speech API |
| **Database** | Supabase (PostgreSQL + pgvector) |
| **AI/ML** | Anthropic Claude, OpenAI Embeddings |
| **Deployment** | Vercel |

</div>

## 📂 Project Structure

```
technica2025/
├── app/
│   ├── (main)/
│   │   ├── calibrate/          # 👁️ Eye tracking calibration
│   │   └── communicate/        # 💬 Main communication interface
│   ├── api/                    # 🔌 API routes (future)
│   └── page.tsx                # 🏠 Landing page
├── components/
│   ├── communication/          # 🎯 Tile grid, text display
│   └── input/                  # 👁️ Eye tracking handler
├── lib/
│   ├── input/
│   │   ├── webgazer-init.ts   # Eye tracking initialization
│   │   └── gaze-utils.ts      # Smoothing & dwell detection
│   └── supabase/              # Database utilities
└── types/                      # TypeScript definitions
```

## 🎨 Features Deep Dive

### Advanced Eye Tracking
- **Exponential Weighted Moving Average**: Combines simple moving average with exponential smoothing
- **Buffer Size**: 10 data points for optimal smoothness
- **20px Margin**: Increased tolerance for easier targeting
- **Alpha Value 0.3**: Balances responsiveness with stability

### Calibration UX
- **Responsive Dots**: Scale from 12px (mobile) to 20px (desktop)
- **Progress Tracking**: Real-time percentage and point counter
- **Bottom Progress Bar**: Doesn't obstruct calibration points
- **Visual States**: Red (active), Green (completed), Gray (inactive)

### Accessibility
- **WCAG Compliant**: High contrast, clear text
- **Responsive**: Works on all devices
- **Multiple Inputs**: Eye tracking, mouse, touch, keyboard
- **Visual Feedback**: Clear indication of selection progress

## 🔮 Future Enhancements

- [ ] **AI-Powered Predictions**: Context-aware word suggestions
- [ ] **User Memory System**: Learn communication patterns
- [ ] **OpenSymbols Integration**: Visual symbols with text
- [ ] **Multi-Language Support**: International accessibility
- [ ] **Offline Mode**: PWA with local functionality
- [ ] **Settings UI**: Adjustable dwell time, sensitivity
- [ ] **Keyboard Navigation**: Full keyboard accessibility

## 📊 Current Implementation Status

### ✅ Completed (Phase 1)
- [x] Eye tracking with WebGazer.js integration
- [x] 5-point streamlined calibration
- [x] Dwell-based tile selection
- [x] Immediate and Compose speech modes
- [x] Text display with copy functionality
- [x] Fully responsive design (mobile → desktop)
- [x] Advanced gaze smoothing algorithms
- [x] Visual feedback (gaze cursor, progress rings)

### 🚧 In Progress (Phase 2)
- [ ] Database integration (Supabase setup complete)
- [ ] AI-powered predictions (Claude API ready)
- [ ] Memory learning system
- [ ] Symbol library integration

## 🤝 Contributing

Contributions are welcome! This project was built for accessibility and can always be improved.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[WebGazer.js](https://webgazer.cs.brown.edu/)** - Webcam eye tracking
- **[OpenSymbols](https://www.opensymbols.org/)** - AAC symbol library
- **[Anthropic](https://www.anthropic.com/)** - Claude AI
- **[Supabase](https://supabase.com/)** - Backend infrastructure
- **[Vercel](https://vercel.com/)** - Deployment platform

## 📞 Support

Having issues? Check our guides:
- 📖 [Eye Tracking Setup Guide](EYE_TRACKING_GUIDE.md)
- 🐛 [Debugging Guide](EYE_TRACKING_DEBUG.md)
- 💡 [Quick Start Guide](QUICKSTART.md)
- 📋 [Full Documentation](CLAUDE.md)

## 🌐 Demo

Try it live: [Coming Soon]

---

<div align="center">

**Made with ❤️ for Technica 2025**

Empowering communication through technology

[⬆ Back to Top](#-adaptive-aac-eye-tracking-system)

</div>
