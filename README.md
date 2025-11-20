# BlendIntel Core

An intelligent nutrition search and recommendation system for Smoothie King menu items, powered by advanced RAG (Retrieval-Augmented Generation) architecture with FDA-compliant nutrition visualization.

## 🎯 Overview

BlendIntel Core transforms natural language nutrition queries into personalized smoothie recommendations by combining vector search, semantic reranking, and conversational AI. Users can type questions like _"What's a high-protein smoothie with strawberries?"_ and receive accurate, context-aware suggestions with complete nutritional information displayed in familiar FDA nutrition label format.

## ✨ Key Features

### 🏷️ **Nutrition Labels**

- **Pixel-Perfect Rendering**: Professionally formatted nutrition facts display
- **Size-Aware Display**: Shows nutrition for selected serving size (20oz, 32oz, 44oz)
- **Visual Impact**: Instantly recognizable format builds user trust

### 🔍 **Semantic Search with RAG**

- **Vector Embeddings**: OpenAI's `text-embedding-3-small` (512 dimensions) converts menu items into semantic representations
- **Pinecone Vector Database**: Stores and queries 300+ smoothie embeddings for lightning-fast similarity search
- **Rich Metadata**: Each vector includes nutrition facts, allergens, ingredients, and available sizes

### 🎯 **Intelligent Reranking**

- **Two-Stage Retrieval**: Initial vector search retrieves 30 candidates, then BGE-Reranker-v2-m3 reranks for precision
- **Cross-Encoder Model**: Deeply analyzes query-document pairs for superior relevance vs. pure vector similarity
- **Context-Aware**: Understands multi-constraint queries (_"45g protein AND strawberries AND under 400 calories"_)

### 💬 **Conversational AI Response**

- **GPT-3.5 Turbo**: Generates natural language explanations for recommendations
- **Nutrition-Focused**: Highlights protein content, macros, allergens, and portion sizes
- **Top 5 Alternatives**: Provides options for dietary restrictions and preferences

### 🔗 **Share & Discover**

- **URL State Persistence**: Share search results via unique URLs
- **Auto-Search from URLs**: Recipients see results instantly
- **Category Filtering**: Browse by smoothies, bowls, or power eats

## 🏗️ Architecture

```
User Input (Text)
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
  - Top Recommendation Card
  - Expandable Alternatives
  - Collapsible Ingredients
  - Share Functionality
```

## 🎨 User Experience Flow

### Search Flow

```
1. User types → "High protein smoothie with strawberries"
2. Category filter (optional) → Smoothies
3. RAG pipeline processes → Gladiator® Strawberry found
4. Display results:
   ┌─────────────────────────────────┐
   │ AI: "Perfect choice! The        │
   │ Gladiator® Strawberry has       │
   │ exactly 45g of protein..."      │
   ├─────────────────────────────────┤
   │ 🏆 Top Recommendation           │
   │                                 │
   │ Gladiator® Strawberry           │
   │ Calories: 220 | Protein: 45g    │
   │ Carbs: 3g | Fat: 3g             │
   │                                 │
   │ 🥣 Ingredients (12)              │
   │ [Expand to view]                │
   │                                 │
   │ 🔗 Share results                │
   └─────────────────────────────────┘
5. User clicks share → URL copied to clipboard
6. Share with friend → Auto-loads same results
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
  "topK": 10,
  "category": "smoothies"
}
```

**Response:**

```json
{
  "query": "...",
  "category": "smoothies",
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
    "ingredients": ["Strawberries", "Protein Blend", ...],
    "availableSizes": ["small(20 oz)", "medium(32 oz)", "large(44 oz)"],
    "nutritionSize": "medium(32 oz)"
  },
  "topFive": [ ... ],
  "allResults": [ ... ],
  "aiResponse": "Great choice! The Gladiator® Strawberry is perfect for your request with exactly 45g of protein...",
  "total": 10,
  "reranked": true
}
```

## 🛠️ Tech Stack

| Component      | Technology                              | Purpose                           |
| -------------- | --------------------------------------- | --------------------------------- |
| **Framework**  | Next.js 15 (App Router)                 | Full-stack React framework        |
| **Frontend**   | React + TypeScript                      | Type-safe UI components           |
| **Styling**    | Tailwind CSS                            | Responsive, utility-first styling |
| **Vector DB**  | Pinecone (Serverless)                   | Semantic search at scale          |
| **Embeddings** | OpenAI text-embedding-3-small           | 512d vectors, $0.00002/1K tokens  |
| **Reranker**   | Pinecone Inference (bge-reranker-v2-m3) | Precision relevance scoring       |
| **LLM**        | OpenAI GPT-3.5 Turbo                    | Natural language responses        |
| **Analytics**  | Vercel Analytics                        | Search tracking & insights        |
| **Language**   | TypeScript/JavaScript                   | Type-safe development             |

## 🧪 Example Queries

| Query                                  | Category   | Top Result                                  | Why It Works                        |
| -------------------------------------- | ---------- | ------------------------------------------- | ----------------------------------- |
| _"45g protein with strawberries"_      | All        | Gladiator® Strawberry (45g)                 | Exact protein match + ingredient    |
| _"Low calorie high protein"_           | Smoothies  | Original High Protein Banana (330 cal, 27g) | Optimizes both constraints          |
| _"Something for after the gym"_        | All        | The Activator® Recovery                     | Context-aware (post-workout)        |
| _"Nut-free option under 300 calories"_ | Power Eats | Power Punch Plus® (280 cal)                 | Allergen exclusion + calorie filter |

## 🎨 Frontend Components

### Search Interface Features

- ✅ Chat-style conversational UI
- ✅ Category filtering (all, smoothies, bowls, power-eats)
- ✅ URL state persistence for sharing
- ✅ Auto-search from shared URLs
- ✅ Loading states with animations
- ✅ Empty state with category suggestions
- ✅ Error handling with friendly messages

### Result Card Features

- ✅ AI-generated explanation with **bold** markdown support
- ✅ Top recommendation with nutrition grid
- ✅ Category badges with color coding
- ✅ Allergen warnings
- ✅ Collapsible ingredients section
- ✅ Share button (Web Share API + clipboard)
- ✅ Expandable alternatives (show top 5)
- ✅ Responsive design (mobile-first)

## 🔐 Environment Variables

```env
# OpenAI API
OPENAI_API_KEY=your_openai_key_here

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_INDEX_NAME=nutrition-information
```

### Getting API Keys

1. **OpenAI**: [platform.openai.com](https://platform.openai.com)
2. **Pinecone**: [app.pinecone.io](https://app.pinecone.io)

## 📝 Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys to .env

# Generate embeddings (one-time setup)
node scripts/embed.js

# Upload to Pinecone (one-time setup)
node scripts/upload-to-pinecone.js

# Start development server
npm run dev

# Open http://localhost:3000/search
```

### Testing the API

**Text Search:**

```bash
curl -X POST http://localhost:3000/api/nutritionSearchRerank \
  -H "Content-Type: application/json" \
  -d '{"query":"high protein smoothie","topK":10,"category":"smoothies"}'
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
3. Verify rate limiting is working (10 requests/hour per IP)

## 🛡️ Rate Limiting

- **Limit**: 10 searches per hour per IP address
- **Purpose**: Protect OpenAI API costs during demo
- **Implementation**: In-memory rate limiter with automatic cleanup
- **User Experience**: Friendly error message with retry time

## 🎓 Learning Outcomes

This project demonstrates:

### Backend/AI Engineering

- ✅ Production RAG architecture (retrieve → rerank → generate)
- ✅ Vector database optimization (metadata sanitization, chunking)
- ✅ Multi-model orchestration (embeddings + reranker + LLM)
- ✅ Cost-effective AI (strategic model selection)
- ✅ Real-world data pipeline (scraping → embedding → indexing)
- ✅ Rate limiting & cost protection

### Frontend/UX Engineering

- ✅ Chat-style conversational interface
- ✅ Responsive, mobile-first design
- ✅ Real-time user feedback (loading states, animations)
- ✅ URL state management for sharing
- ✅ Progressive disclosure (collapsible sections)
- ✅ Markdown parsing for rich text formatting

### Full-Stack Integration

- ✅ Next.js 15 App Router patterns
- ✅ TypeScript type safety across stack
- ✅ API route design for AI services
- ✅ Server-side rate limiting
- ✅ Analytics integration
- ✅ Error handling & user feedback

## 🔮 Future Enhancements

### Planned Features

- [ ] **Spanish Language Support**: Bilingual UI and query translation for Hispanic customers
- [ ] **Nutrition-Based Filtering**: Client-side filters for calories, protein, carbs, allergens
- [ ] **User Preferences**: Save favorite searches and dietary restrictions
- [ ] **Comparison Mode**: Side-by-side nutrition comparison of multiple items
- [ ] **Enhanced Analytics**: Track popular queries, category preferences, conversion metrics
- [ ] **Caching Layer**: Redis for frequently searched queries
- [ ] **Component Refactoring**: Break down large components for better maintainability

### Technical Improvements

- [ ] Spanish embeddings index for better multilingual search
- [ ] Advanced reranking with nutrition-aware scoring
- [ ] Progressive Web App (PWA) capabilities
- [ ] Offline mode with cached results
- [ ] A/B testing framework for search quality
- [ ] Comprehensive unit and integration tests

## 📊 Project Stats

- **Lines of Code**: 6,353 (smoothies.json)
- **Menu Items**: 300+
- **Categories**: 3 (Smoothies, Bowls, Power Eats)
- **Nutrition Fields**: 6 per item (calories, protein, carbs, fat, sugar, fiber)
- **Vector Dimensions**: 512
- **Average Search Latency**: ~2-3 seconds (embedding + vector search + rerank + GPT)

## 📄 License

MIT

---

## 🏗️ Component Architecture

BlendIntel uses a **modular component architecture** with centralized state management for maintainability and scalability.

### 📁 Component Structure

```
src/app/search/components/
├── layout/          # Page structure (header, filter, input)
├── states/          # Loading, error, empty states
├── messages/        # Chat interface components
├── results/         # Search result display
└── shared/          # Reusable UI components
```

### 🧠 State Management Strategy

**Context API** (`SearchContext`) manages:

- Search query and results
- Loading/error states
- Category selection
- UI state (expanded items, show all results)

**Props** for pure display components:

- `NutritionGrid`, `AllergenBadges`, `CategoryBadge`
- Better testability and reusability

### 🎯 Adding New Components

1. Determine if state comes from **Context** or **Props**
2. Create component in appropriate directory
3. Add to barrel export (`index.ts`)
4. Import and use in parent component

**Built with ❤️ for nutrition-conscious smoothie lovers**

_Combining the power of RAG, semantic search, and thoughtful UX design to make healthy choices effortless._
