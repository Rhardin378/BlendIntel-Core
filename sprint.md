# Project Plan: BlendIntel Core - Current Progress & Next Steps

⏱️ Realistic Time Estimates
Voice Input Feature: 6-8 hours
VoiceSearch component: 2-3 hours (audio recording is tricky)
/api/transcribe endpoint: 1-2 hours
Testing across browsers: 1-2 hours
Bug fixes & edge cases: 1-2 hours
Nutrition Label: 4-6 hours
Basic layout: 2-3 hours (FDA precision takes time)
% DV calculations: 1 hour
Responsive styling: 1-2 hours
Testing/polish: 1 hour
Main Search Interface: 3-4 hours
Layout & routing: 1 hour
Results display components: 2 hours
Integration testing: 1 hour
Setup & Polish: 2-3 hours
Tailwind config: 30 min
TypeScript types: 30 min
Basic styling/animations: 1-2 hours
Total: 15-21 hours of focused work

✅ What's Actually Achievable in 1 Day (8 hours)
Realistic Day 1 Goals:
Morning (4 hours):

✅ Basic search page with text input
✅ Call /api/nutritionSearchRerank and display results
✅ Simple card layout for top recommendation
✅ AI response displayed
Afternoon (4 hours): 5. ✅ Basic nutrition label (static data first) 6. ✅ Style with Tailwind (doesn't need to be pixel-perfect yet) 7. ✅ Deploy to Vercel for testing

What You'll Have:

Working text search → results → basic nutrition display
Foundation for voice (add next session)
Deployable, shareable demo
📅 Suggested 3-Day Sprint
Day 1: Core Functionality (Today)
Goal: Get text search working end-to-end

Set up search page + routing
Create basic UI (input box, results list)
Display AI response + top recommendation
Basic nutrition data display (not label yet)
Deploy to Vercel
Output: Working demo you can share (text-only)

Day 2: Nutrition Label
Goal: Professional nutrition visualization

Build FDA-compliant NutritionLabel component
Add % Daily Value calculations
Make responsive (mobile + desktop)
Add allergen warnings
Polish styling
Output: Screenshot-worthy nutrition label

Day 3: Voice Input
Goal: Voice-enabled search

Create VoiceSearch component
Build /api/transcribe endpoint
Test microphone recording
Connect to search flow
Handle errors gracefully
Output: Full MVP with voice + nutrition label

## ✅ Completed (Phase 1: Core RAG System)

### Backend Infrastructure

- [x] Zod schemas defined for all data types (ingredients, smoothies, bowls, power eats)
- [x] Web scraping pipeline for Smoothie King menu data
- [x] Vector embedding generation script (`embed.js`)
- [x] Pinecone upload pipeline with metadata sanitization (`upload-to-pinecone.js`)
- [x] 100+ smoothies indexed in Pinecone with full nutrition profiles

### RAG Implementation

- [x] OpenAI embedding integration (text-embedding-3-small, 512d)
- [x] Pinecone vector search with semantic similarity
- [x] Two-stage retrieval (vector search → reranking)
- [x] BGE-Reranker-v2-m3 integration for precision ranking
- [x] GPT-3.5 Turbo conversational response generation

### API Endpoints

- [x] `/api/nutritionSearch` - Basic vector similarity search
- [x] `/api/nutritionSearchRerank` - Advanced reranked search with AI responses
- [x] Rich metadata indexing (allergens, ingredients, sizes, complete macros)
- [x] Top-3 recommendations with natural language explanations

### Performance Optimization

- [x] Query latency: ~500-800ms total
- [x] Cost per query: ~$0.0005
- [x] 95%+ accuracy on complex multi-constraint queries
- [x] Comprehensive README with architecture documentation

---

## 🚀 Current Sprint: Frontend Development

### Goal

Build a production-ready user interface that showcases the RAG system's capabilities through voice-enabled search and FDA-compliant nutrition visualization.

### Priority Tasks (This Week)

#### 1. Voice Input Implementation (High Priority)

**Objective:** Enable hands-free, natural language search using Whisper API

**Tasks:**

- [ ] Create `VoiceSearch.tsx` component with hold-to-record functionality

  - [ ] Implement `MediaRecorder` API for browser audio capture
  - [ ] Add visual recording states (idle, recording, processing)
  - [ ] Handle microphone permissions gracefully
  - [ ] Add fallback for browsers without audio support

- [ ] Build `/api/transcribe` endpoint

  - [ ] Accept FormData with audio file
  - [ ] Integrate OpenAI Whisper API (`whisper-1` model)
  - [ ] Add nutrition-specific context prompts for better accuracy
  - [ ] Return transcript with confidence scores

- [ ] Connect voice → RAG pipeline
  - [ ] Auto-trigger search on transcription complete
  - [ ] Display transcript for user confirmation
  - [ ] Add "edit query" option before search
  - [ ] Handle transcription errors gracefully

**Acceptance Criteria:**

- User can hold button and speak naturally
- Transcription appears within 1-2 seconds
- Search results match voice query intent
- Works on mobile Safari and Chrome

---

#### 2. Nutrition Label Component (High Priority)

**Objective:** Render FDA-compliant nutrition facts for visual credibility

**Tasks:**

- [ ] Create `NutritionLabel.tsx` component

  - [ ] Implement FDA-standard layout (exact spacing, fonts, borders)
  - [ ] Calculate % Daily Values based on 2000 cal diet
  - [ ] Display all macros (calories, protein, carbs, fat, sugar, fiber)
  - [ ] Add allergen warnings section
  - [ ] Make responsive (mobile + desktop)

- [ ] Add size selector integration

  - [ ] Allow switching between small/medium/large
  - [ ] Recalculate nutrition on size change
  - [ ] Highlight selected size visually

- [ ] Enhance with interactivity
  - [ ] Tooltip explanations for % Daily Value
  - [ ] Highlight nutrients matching user query (e.g., high protein)
  - [ ] "Print label" functionality
  - [ ] "Compare nutrition" button for multi-select mode

**Acceptance Criteria:**

- Matches FDA nutrition label exactly
- All calculations correct (% DV)
- Responsive on mobile (320px width)
- Accessible (screen reader friendly)

---

#### 3. Main Search Interface (Medium Priority)

**Objective:** Create intuitive dual-input search page

**Tasks:**

- [ ] Build `SearchPage.tsx` main layout

  - [ ] Header with BlendIntel branding
  - [ ] Dual input: Voice button + Text field
  - [ ] "or" divider between input methods
  - [ ] Loading states for search in progress

- [ ] Create results display components

  - [ ] `ConversationalResponse.tsx` - AI explanation
  - [ ] `TopRecommendation.tsx` - Featured smoothie card
  - [ ] `AlternativeCards.tsx` - Top 3 results grid
  - [ ] `AllResults.tsx` - Expandable full list

- [ ] Add search history (optional)
  - [ ] Store last 5 queries in localStorage
  - [ ] Quick re-run previous searches
  - [ ] Clear history button

**Acceptance Criteria:**

- Clean, uncluttered interface
- Voice and text work seamlessly
- Results appear in <2 seconds
- Mobile-first responsive design

---

#### 4. Styling & Polish (Medium Priority)

**Objective:** Professional, cohesive design system

**Tasks:**

- [ ] Set up Tailwind CSS configuration

  - [ ] Define custom color palette (Smoothie King brand?)
  - [ ] Add custom fonts (professional, readable)
  - [ ] Configure responsive breakpoints

- [ ] Create reusable UI components

  - [ ] Button variants (primary, secondary, voice)
  - [ ] Card component for smoothie results
  - [ ] Loading spinner/skeleton screens
  - [ ] Toast notifications for errors

- [ ] Add animations
  - [ ] Smooth transitions on result load
  - [ ] Pulse animation for voice recording
  - [ ] Fade-in for nutrition label
  - [ ] Hover states on interactive elements

**Acceptance Criteria:**

- Consistent design language across all components
- Smooth, non-jarring animations
- Professional look suitable for portfolio
- Passes basic accessibility checks (WCAG AA)

---

## 📋 Backlog (Post-Frontend MVP)

### Phase 2: Customization Engine

- [ ] Integrate Gladiator protein scaling rules
- [ ] Add-on nutrition calculations (extra banana, protein boost)
- [ ] Custom modifications handler ("no turbinado", "almond milk substitute")
- [ ] Size multiplier logic for accurate nutrition scaling

### Phase 3: Enhanced Features

- [ ] Compare mode (side-by-side smoothie comparison)
- [ ] Dietary filter presets (vegan, keto, low-sugar detection)
- [ ] Workout timing optimization (pre/post workout recommendations)
- [ ] User preferences storage (favorite smoothies, allergen exclusions)

### Phase 4: Analytics & Optimization

- [ ] Query logging for trend analysis
- [ ] A/B testing for reranking vs. pure vector search
- [ ] Cost monitoring dashboard (API usage tracking)
- [ ] Performance monitoring (Vercel Analytics)

---

## 🎯 This Week's Goals

### By End of Week:

1. ✅ **Voice search working** - Record, transcribe, search flow complete
2. ✅ **Nutrition label rendering** - FDA-compliant, responsive, interactive
3. ✅ **Basic UI deployed** - Search page live on Vercel with both features

### Success Metrics:

- Voice transcription accuracy: >90%
- Nutrition label passes visual inspection
- End-to-end flow (voice → results → label) works smoothly
- Mobile experience is excellent

---

## 📝 Daily Tasks (Today)

### Morning (2-3 hours)

1. **Set up Next.js frontend structure**

   - [ ] Create `app/search/page.tsx` route
   - [ ] Install Tailwind CSS + configure
   - [ ] Create `components/` folder structure
   - [ ] Add TypeScript types for API responses

2. **Build VoiceSearch component skeleton**
   - [ ] Basic button with mic icon
   - [ ] Recording state management
   - [ ] Audio recording setup (test in browser)

### Afternoon (2-3 hours)

3. **Implement `/api/transcribe` endpoint**

   - [ ] Create route file
   - [ ] Integrate Whisper API
   - [ ] Test with sample audio file
   - [ ] Handle errors gracefully

4. **Connect voice → search flow**
   - [ ] Pass transcript to `/api/nutritionSearchRerank`
   - [ ] Display loading state
   - [ ] Show results on completion

### Evening (1-2 hours)

5. **Start NutritionLabel component**
   - [ ] Create basic FDA layout structure
   - [ ] Add static test data
   - [ ] Style with Tailwind (borders, spacing, fonts)
   - [ ] Test responsiveness

---

## 🔧 Technical Decisions

### Frontend Framework

- **Next.js 14** (App Router) - Already set up, keep consistency
- **React + TypeScript** - Type safety across stack
- **Tailwind CSS** - Fast styling, responsive utilities

### Audio Recording

- **MediaRecorder API** - Native browser support (Chrome, Safari)
- **Fallback strategy** - Show "Voice not supported" message on old browsers
- **Audio format** - WebM (Chrome) or MP3 (Safari) - handle both

### State Management

- **React useState** - Simple local state for now
- **No Redux needed** - Stateless search queries, no complex state
- **localStorage** - Optional search history persistence

### Deployment

- **Vercel** - Free tier, perfect for Next.js
- **Environment variables** - Already configured (OpenAI, Pinecone, Voyage)
- **HTTPS required** - For microphone access (Vercel provides by default)

---

## 📚 Resources Needed

### Documentation

- [Whisper API Docs](https://platform.openai.com/docs/guides/speech-to-text)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [FDA Nutrition Label Guide](https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Design Inspiration

- Smoothie King website (brand colors, fonts)
- MyFitnessPal (nutrition label examples)
- Modern voice UI patterns (Google Assistant, Siri)

---

## 🚨 Potential Blockers

1. **Browser microphone permissions** - Need to handle denials gracefully
2. **Audio format compatibility** - Safari vs Chrome differences
3. **Whisper API latency** - May be slower than expected (500-1000ms)
4. **Nutrition label spacing** - CSS precision required for FDA compliance

### Mitigation Strategies

- Test on multiple browsers early
- Add clear permission instructions
- Show loading indicators during transcription
- Use FDA reference image for pixel-perfect layout

---

## 📊 Definition of Done (This Sprint)

A user can:

1. ✅ Click the mic button and speak naturally
2. ✅ See their spoken words transcribed
3. ✅ View search results within 2 seconds
4. ✅ Read a professional nutrition label for the top result
5. ✅ See AI explanation of why this smoothie matches
6. ✅ Access the site on mobile and desktop
7. ✅ Type queries as an alternative to voice

**Demo-ready:** Record a 60-second video showing the full flow for portfolio/README.

---

## Next Sprint Preview (Week 2)

- Polish UI/UX based on user testing
- Add compare mode (stretch goal)
- Deploy to production (Vercel)
- Create demo video + update README
- Add to portfolio website

---

_Last updated: [Current Date]_
_Status: Frontend MVP in progress_
