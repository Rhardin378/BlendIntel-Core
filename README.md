# BlendIntel Core

An intelligent nutrition search and recommendation system for Smoothie King menu items, powered by advanced RAG (Retrieval-Augmented Generation) architecture with voice-enabled search and FDA-compliant nutrition visualization.

## 🎯 Overview

BlendIntel Core transforms natural language nutrition queries into personalized smoothie recommendations by combining vector search, semantic reranking, and conversational AI. Users can **speak or type** questions like _"What's a high-protein smoothie with strawberries?"_ and receive accurate, context-aware suggestions with complete nutritional information displayed in familiar FDA nutrition label format.

## ✨ Key Features

### 🎤 **Voice-Enabled Search**

- **Whisper API Integration**: Hands-free search using OpenAI's speech-to-text model
- **Mobile-Optimized**: Perfect for gym users who need quick nutrition info
- **Natural Language Processing**: Speak naturally - "I need something high in protein after my workout"
- **Real-time Transcription**: See your spoken query transcribed instantly

### 🏷️ **Nutrition Labels**

- **Pixel-Perfect Rendering**: Professionally formatted nutrition facts display
- **Size-Aware Display**: Shows nutrition for selected serving size (20oz, 32oz, 44oz)
- **Visual Impact**: Instantly recognizable format builds user trust

### 🔍 **Semantic Search with RAG**

- **Vector Embeddings**: OpenAI's `text-embedding-3-small` (512 dimensions) converts menu items into semantic representations
- **Pinecone Vector Database**: Stores and queries 100+ smoothie embeddings for lightning-fast similarity search
- **Rich Metadata**: Each vector includes nutrition facts, allergens, ingredients, and available sizes

### 🎯 **Intelligent Reranking**

- **Two-Stage Retrieval**: Initial vector search retrieves 30 candidates, then BGE-Reranker-v2-m3 reranks for precision
- **Cross-Encoder Model**: Deeply analyzes query-document pairs for superior relevance vs. pure vector similarity
- **Context-Aware**: Understands multi-constraint queries (_"45g protein AND strawberries AND under 400 calories"_)

### 💬 **Conversational AI Response**

- **GPT-3.5 Turbo**: Generates natural language explanations for recommendations
- **Nutrition-Focused**: Highlights protein content, macros, allergens, and portion sizes
- **Top 3 Alternatives**: Provides options for dietary restrictions and preferences

## 🏗️ Architecture

```
User Input (Voice/Text)
    ↓
[Whisper API] → Transcription (if voice)
    ↓
[OpenAI Embeddings] → Query Vector (512d)
    ↓
[Pinecone Search] → Top 30 Candidates (vector similarity)
    ↓
[BGE Reranker] → Top 10 Results (relevance scoring)
    ↓
[GPT-3.5 Turbo] → Natural Language Response
    ↓
Frontend Display:
  - AI Conversational Response
  - FDA Nutrition Label
  - Top 3 Alternative Cards
```

## 🎨 User Experience Flow

### Voice Search Flow

```
1. User holds mic button → 🎤 "High protein smoothie with strawberries"
2. Whisper transcribes → "High protein smoothie with strawberries"
3. RAG pipeline processes → Gladiator® Strawberry found
4. Display results:
   ┌─────────────────────────────────┐
   │ AI: "Perfect choice! The        │
   │ Gladiator® Strawberry has       │
   │ exactly 45g of protein..."      │
   ├─────────────────────────────────┤
   │   Nutrition Facts               │
   │   Serving Size: 32 oz           │
   │   Calories           220        │
   │   Protein 45g              90%  │
   │   ...                           │
   └─────────────────────────────────┘
```

### Text Search Flow

```
1. User types → "Low calorie high protein"
2. RAG pipeline processes
3. Display nutrition label for Original High Protein Banana
4. Show 2 alternatives with quick comparison
```

## 📊 Data Pipeline

### 1. **Web Scraping**

- Scraped 100+ Smoothie King menu items with complete nutrition profiles
- Extracted size variations, ingredients, allergens, and macros

### 2. **Vector Generation**

```bash
node scripts/embed.js
# → Generates embeddings for all smoothies
# → Output: smoothies_vectors.json, ingredients_vectors.json, etc.
```

### 3. **Pinecone Upload**

```bash
node scripts/upload-to-pinecone.js
# → Sanitizes metadata (flattens nested objects)
# → Chunks uploads (100 vectors/batch)
# → Creates index if needed
```

## 🚀 API Endpoints

### `POST /api/nutritionSearchRerank`

**Request:**

```json
{
  "query": "What is a Smoothie with 45 protein and strawberries",
  "topK": 10
}
```

**Response:**

```json
{
  "query": "...",
  "topRecommendation": {
    "id": "smoothies_27",
    "name": "Gladiator® Strawberry",
    "nutrition_protein": 45,
    "nutrition_calories": 220,
    "nutrition_carbs": 3,
    "nutrition_fat": 3,
    "nutrition_sugar": 1,
    "nutrition_fiber": 1,
    "allergens": ["Egg", "Milk"],
    "availableSizes": ["small(20 oz)", "medium(32 oz)", "large(44 oz)"],
    "nutritionSize": "medium(32 oz)"
  },
  "topThree": [ ... ],
  "aiResponse": "Great choice! The Gladiator® Strawberry is perfect for your request with exactly 45g of protein...",
  "reranked": true
}
```

### `POST /api/transcribe`

**Request:**

```
FormData: { audio: File (webm/mp3) }
```

**Response:**

```json
{
  "transcript": "High protein smoothie with strawberries"
}
```

## 🛠️ Tech Stack

| Component         | Technology                     | Purpose                           |
| ----------------- | ------------------------------ | --------------------------------- |
| **Framework**     | Next.js 14 (App Router)        | Full-stack React framework        |
| **Frontend**      | React + TypeScript             | Type-safe UI components           |
| **Styling**       | Tailwind CSS                   | Responsive, utility-first styling |
| **Vector DB**     | Pinecone (Serverless)          | Semantic search at scale          |
| **Embeddings**    | OpenAI text-embedding-3-small  | 512d vectors, $0.00002/1K tokens  |
| **Reranker**      | Voyage AI (bge-reranker-v2-m3) | Precision relevance scoring       |
| **LLM**           | OpenAI GPT-3.5 Turbo           | Natural language responses        |
| **Voice-to-Text** | OpenAI Whisper API             | Speech transcription              |
| **Language**      | TypeScript/JavaScript          | Type-safe development             |

## 🧪 Example Queries

| Query                                  | Input Method | Top Result                                  | Why It Works                        |
| -------------------------------------- | ------------ | ------------------------------------------- | ----------------------------------- |
| _"45g protein with strawberries"_      | Voice        | Gladiator® Strawberry (45g)                 | Exact protein match + ingredient    |
| _"Low calorie high protein"_           | Text         | Original High Protein Banana (330 cal, 27g) | Optimizes both constraints          |
| _"Something for after the gym"_        | Voice        | The Activator® Recovery                     | Context-aware (post-workout)        |
| _"Nut-free option under 300 calories"_ | Text         | Power Punch Plus® (280 cal)                 | Allergen exclusion + calorie filter |

## 🎨 Frontend Components


### Nutrition Label Features

- ✅ Macros and Calorie Information
- ✅ Responsive design (mobile-first)
- ✅ Allergen warnings highlighted
- ✅ Serving size selector

### Voice Input Features

- ✅ Hold-to-record button (desktop/mobile)
- ✅ Visual recording indicator
- ✅ Real-time transcription display
- ✅ Automatic search trigger
- ✅ Fallback to text input

## 🔐 Environment Variables

```env
# OpenAI (embeddings, GPT-3.5, Whisper)
OPENAI_API_KEY=sk-...

# Pinecone Vector Database
PINECONE_API_KEY=...
<<<<<<< HEAD
PINECONE_INDEX_NAME=nutrition-information

=======
PINECONE_INDEX_NAME=...
>>>>>>> 27b65cb9c9f5328b01af549c25ab13d69fb65254
```

## 📝 Local Development

```bash
# Install dependencies
npm install

# Generate embeddings (one-time setup)
node scripts/embed.js

# Upload to Pinecone (one-time setup)
node scripts/upload-to-pinecone.js

# Start development server
npm run dev

# Open http://localhost:3000
```

### Testing the API

**Text Search:**

```bash
curl -X POST http://localhost:3000/api/nutritionSearchRerank \
  -H "Content-Type: application/json" \
  -d '{"query":"high protein smoothie","topK":5}'
```

**Voice Transcription:**

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@recording.webm"
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Environment Setup

1. Add all API keys to Vercel project settings
2. Ensure Pinecone index is created and populated
3. Test voice recording in production (requires HTTPS)

## 🎓 Learning Outcomes

This project demonstrates:

### Backend/AI Engineering

- ✅ Production RAG architecture (retrieve → rerank → generate)
- ✅ Vector database optimization (metadata sanitization, chunking)
- ✅ Multi-model orchestration (embeddings + reranker + LLM + Whisper)
- ✅ Cost-effective AI (strategic model selection)
- ✅ Real-world data pipeline (scraping → embedding → indexing)

### Frontend/UX Engineering

- ✅ Accessible voice input implementation
- ✅ Responsive, mobile-first design
- ✅ Real-time user feedback (recording states, loading indicators)
- ✅ Progressive enhancement (voice OR text input)

### Full-Stack Integration

- ✅ Next.js 14 App Router patterns
- ✅ TypeScript type safety across stack
- ✅ API route design for AI services
- ✅ Client-side audio recording and processing
- ✅ Multimodal user interfaces

## 🔮 Future Enhancements

## 📄 License

MIT

---

**Built with ❤️ for nutrition-conscious smoothie lovers**

_Combining the power of RAG, voice AI, and thoughtful UX design to make healthy choices effortless._
