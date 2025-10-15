# 🎫 Sprint Item: Fix Smoothie vs Bowl Search Results

**Priority:** High  
**Estimate:** 1-2 hours  
**Status:** 🟢 Not Started  
**Category:** Bug Fix / Feature Enhancement

---

## 📋 Problem Description

**Current Behavior:**
When users search for "smoothies with blueberries and strawberries", the API returns **Smoothie Bowls** instead of drinkable smoothies.

**Example:**

```
Query: "smoothies with ingredients blueberries and strawberries"

Current Results:
1. PB Delight™ Bowl ❌
2. Go Go Goji Crunch™ Bowl ❌
3. PB Swizzle™ Bowl ❌

Expected Results:
1. Berry Blast Smoothie ✅
2. Strawberry X-Treme Smoothie ✅
3. Blueberry Heaven Smoothie ✅
```

**Root Cause:**

- Pinecone index contains both smoothies and bowls
- Reranker scores bowls highly because they match ingredient criteria
- No category filtering applied in search query

---

## 🎯 Acceptance Criteria

- [ ] Users searching for "smoothie" get drinkable smoothies, not bowls
- [ ] Users have option to search bowls specifically
- [ ] "All" option shows both smoothies and bowls
- [ ] Filter persists across searches in same session
- [ ] UI clearly indicates which category is active

---

## 🛠️ Implementation Options

### Option A: Add Category Filter to API (Quick Fix - 30 min)

**File:** `src/app/search/page.tsx`

```tsx
// In handleSearch function
const handleSearch = async () => {
  // ...
  body: JSON.stringify({
    query: query.trim(),
    topK: 10,
    filter: { category: { $ne: "Smoothie Bowl" } } // Exclude bowls
  }),
  // ...
};
```

**Pros:**

- ✅ Quick to implement
- ✅ Fixes the immediate issue
- ✅ No UI changes needed

**Cons:**

- ❌ Users can't search for bowls
- ❌ Hard-coded, inflexible

---

### Option B: Add Category Toggle in Header (Recommended - 1-2 hours)

**File:** `src/app/search/page.tsx`

**Changes:**

1. Add state for search type
2. Add toggle buttons in header
3. Pass filter to API based on selection
4. Persist selection in localStorage (optional)

**Code Snippet:**

```tsx
const [searchType, setSearchType] = useState<"smoothies" | "bowls" | "all">("smoothies");

// In header, replace "New Chat" button with:
<div className="flex gap-2">
  <button
    onClick={() => setSearchType("smoothies")}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
      searchType === "smoothies"
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    🥤 Smoothies
  </button>
  <button
    onClick={() => setSearchType("bowls")}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
      searchType === "bowls"
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    🍓 Bowls
  </button>
  <button
    onClick={() => setSearchType("all")}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
      searchType === "all"
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    ⭐ All
  </button>
</div>

// In handleSearch:
const filter = searchType === "smoothies"
  ? { category: { $ne: "Smoothie Bowl" } }
  : searchType === "bowls"
  ? { category: "Smoothie Bowl" }
  : undefined;

body: JSON.stringify({
  query: query.trim(),
  topK: 10,
  ...(filter && { filter })
}),
```

**Pros:**

- ✅ User control
- ✅ Clear visual feedback
- ✅ Flexible for future categories
- ✅ Better UX

**Cons:**

- ❌ More code
- ❌ Requires API to support filtering

---

### Option C: Backend API Filter (Fallback - 30 min)

**File:** `src/app/api/nutritionSearchRerank/route.ts`

```tsx
// In Pinecone query
const results = await index.query({
  vector: embedding,
  topK: topK * 3,
  includeMetadata: true,
  filter: {
    category: { $ne: "Smoothie Bowl" },
  },
});
```

**Pros:**

- ✅ Centralized logic
- ✅ Works even if frontend doesn't pass filter

**Cons:**

- ❌ Requires backend changes
- ❌ Hard-coded (no user choice)

---

## 📝 Tasks Breakdown

### Task 1: Add TypeScript Type (5 min)

```tsx
type SearchType = "smoothies" | "bowls" | "all";
```

### Task 2: Add State Management (5 min)

```tsx
const [searchType, setSearchType] = useState<SearchType>("smoothies");
```

### Task 3: Build Category Toggle UI (30 min)

- Replace "New Chat" button with 3-button toggle
- Add active state styling
- Add hover effects
- Make responsive on mobile

### Task 4: Update handleSearch Function (15 min)

- Build filter object based on searchType
- Pass to API
- Handle "all" case (no filter)

### Task 5: Test All Scenarios (30 min)

- [ ] Test "smoothies" mode with bowl ingredients → returns smoothies
- [ ] Test "bowls" mode → returns only bowls
- [ ] Test "all" mode → returns both
- [ ] Test filter persists across multiple searches
- [ ] Test mobile responsiveness

### Task 6: Optional - Add localStorage Persistence (15 min)

```tsx
useEffect(() => {
  const saved = localStorage.getItem("searchType");
  if (saved) setSearchType(saved as SearchType);
}, []);

useEffect(() => {
  localStorage.setItem("searchType", searchType);
}, [searchType]);
```

---

## 🧪 Test Cases

| Test Case     | Input                          | Expected Category | Expected Result                  |
| ------------- | ------------------------------ | ----------------- | -------------------------------- |
| Smoothie mode | "blueberries and strawberries" | Smoothies         | Returns drinkable smoothies      |
| Bowl mode     | "blueberries and strawberries" | Bowls             | Returns smoothie bowls           |
| All mode      | "high protein"                 | All               | Returns both smoothies and bowls |
| Smoothie mode | "post workout"                 | Smoothies         | No bowls in results              |
| Default state | New page load                  | Smoothies         | Starts in smoothies mode         |

---

## 📸 Visual Mock (Before/After)

**Before:**

```
┌─────────────────────────────────┐
│ [Logo] BlendIntel  [New Chat]  │
└─────────────────────────────────┘
```

**After:**

```
┌──────────────────────────────────────────────────┐
│ [Logo] BlendIntel  [🥤 Smoothies] [🍓 Bowls] [⭐ All] │
└──────────────────────────────────────────────────┘
```

---

## 🔧 Dependencies

### API Requirements:

- [ ] Verify `/api/nutritionSearchRerank` accepts `filter` parameter
- [ ] Test Pinecone filter syntax works
- [ ] Confirm category field exists in all indexed items

### Potential Blockers:

- API might not support filtering (need to check route file)
- Category field might have different names ("category" vs "type")
- Some items might not have category metadata

---

## 📚 Reference Files

- **Frontend:** `src/app/search/page.tsx` (lines 15-35 for handleSearch)
- **API Route:** `src/app/api/nutritionSearchRerank/route.ts`
- **Types:** `src/app/types/menuItem.ts` (SearchResponse interface)
- **Schemas:** `schemas/smoothieSchema.ts`, `schemas/smoothieBowlSchema.ts`

---

## 💡 Future Enhancements (Post-MVP)

- [ ] Add "Power Eats" category if applicable
- [ ] Add visual icons to results showing category
- [ ] Add category to suggestion chips ("🥤 High protein smoothie")
- [ ] Show category count in toggle buttons ("Smoothies (67)")
- [ ] Add category to URL params for shareable links

---

## ✅ Definition of Done

- [ ] Code implemented and tested locally
- [ ] Works in all 3 modes (smoothies, bowls, all)
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Test queries return correct categories
- [ ] UI is intuitive (no user confusion)
- [ ] Code reviewed and committed
- [ ] Deployed to Vercel and tested in production

---

**Priority Justification:** This is a **critical bug** that affects core search functionality. Users asking for "smoothies" should get smoothies, not bowls. Fixing this builds trust in the AI system.

**Recommended Approach:** Start with **Option B** (Category Toggle). If API doesn't support filtering, fall back to **Option C** (Backend Filter) first, then add frontend toggle later.

---

_Created: [Current Date]_  
_Assigned to: You_  
_Sprint: Day 2 - Frontend Polish_

# Day 1 Sprint: Tickets Breakdown

**Goal:** Ship working text search demo by end of day  
**Total Time:** 8 hours  
**Status:** 🟢 Ready to start

---

## 🎫 Ticket System

### Legend:

- 🟢 **Not Started**
- 🟡 **In Progress**
- ✅ **Complete**
- 🔴 **Blocked**

---

## Hour 1-2: Setup & Foundation

### 🎫 Ticket #1: Install & Configure Tailwind CSS

**Priority:** Critical  
**Estimate:** 20 min  
**Status:** ✅ (completed at initial project setup)

**Tasks:**

- [ ] Run `npm install -D tailwindcss postcss autoprefixer`
- [ ] Run `npx tailwindcss init -p`
- [ ] Update `tailwind.config.js` with content paths
- [ ] Add Tailwind directives to `globals.css`
- [ ] Test: Add a colored div to verify Tailwind works

**Acceptance Criteria:**

- `npm run dev` works without errors
- Tailwind classes render correctly
- Hot reload working

**Files Created/Modified:**

- `tailwind.config.js`
- `postcss.config.js`
- `src/app/globals.css`

---

### 🎫 Ticket #2: Create TypeScript Type Definitions

**Priority:** High  
**Estimate:** 15 min  
**Status:** ✅

**Tasks:**

- [ ] Create `src/types/smoothie.ts`
- [ ] Define `Smoothie` interface
- [ ] Define `SearchResponse` interface
- [ ] Export types

**Acceptance Criteria:**

- No TypeScript errors
- Types match API response structure
- Autocomplete works in VS Code

**Code:**

```typescript
// src/types/smoothie.ts
export interface Smoothie {
  id: string;
  name: string;
  category: string;
  nutrition_calories: number;
  nutrition_protein: number;
  nutrition_carbs: number;
  nutrition_fat: number;
  nutrition_sugar: number;
  nutrition_fiber: number;
  allergens: string[];
  ingredients: string[];
  availableSizes: string[];
  nutritionSize: string;
  rerankScore?: number;
  score?: number;
}

export interface SearchResponse {
  query: string;
  topRecommendation: Smoothie;
  topThree: Smoothie[];
  allResults: Smoothie[];
  aiResponse: string;
  reranked: boolean;
  total: number;
}
```

---

### 🎫 Ticket #3: Create Search Page Route

**Priority:** Critical  
**Estimate:** 25 min  
**Status:** ✅

**Tasks:**

- [ ] Create `src/app/search/page.tsx`
- [ ] Add basic page structure with header
- [ ] Make it a client component (`'use client'`)
- [ ] Add responsive container layout
- [ ] Test route loads at `/search`

**Acceptance Criteria:**

- Page loads without errors
- Responsive layout works on mobile
- Header displays correctly

**Code:**

```typescript
// src/app/search/page.tsx
"use client";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            BlendIntel
          </h1>
          <p className="text-gray-600">
            Find your perfect smoothie with AI-powered search
          </p>
        </header>

        {/* Search components will go here */}
      </div>
    </div>
  );
}
```

---

## Hour 3-4: Search Input & API Integration

### 🎫 Ticket #4: Build Search Input Component

**Priority:** Critical  
**Estimate:** 30 min  
**Status:** ✅

**Tasks:**

- [ ] Add state management (`useState` for query, loading, results)
- [ ] Create controlled input field
- [ ] Add search button
- [ ] Add Enter key handler
- [ ] Add loading state UI

**Acceptance Criteria:**

- Input is controlled (value updates on type)
- Enter key triggers search
- Button disabled when loading or empty
- Loading text appears

**Code:**

```typescript
// Add to SearchPage component
import { useState } from "react";
import { SearchResponse } from "@/types/smoothie";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    // ...existing header...
    <div className="mb-8">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !loading && query && handleSearch()
          }
          placeholder="Ask about smoothies... (e.g., high protein with strawberries)"
          className="w-full p-4 pr-12 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
          disabled={loading}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading || !query.trim()}
        className="mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Searching...
          </span>
        ) : (
          "Search"
        )}
      </button>
    </div>
  );
}
```

---

### 🎫 Ticket #5: Implement API Call Function

**Priority:** Critical  
**Estimate:** 30 min  
**Status:** 🟢

**Tasks:**

- [ ] Create `handleSearch` async function
- [ ] Add try/catch error handling
- [ ] Call `/api/nutritionSearchRerank`
- [ ] Update loading states
- [ ] Console log response for testing

**Acceptance Criteria:**

- API call succeeds
- Response logged to console
- Loading states work correctly
- Errors caught and displayed

**Code:**

```typescript
// Add to SearchPage component
const handleSearch = async () => {
  if (!query.trim()) return;

  setLoading(true);
  setError(null);

  try {
    const response = await fetch("/api/nutritionSearchRerank", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query.trim(),
        topK: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data: SearchResponse = await response.json();
    console.log("Search results:", data); // For debugging
    setResults(data);
  } catch (err) {
    console.error("Search error:", err);
    setError(err instanceof Error ? err.message : "Search failed");
  } finally {
    setLoading(false);
  }
};
```

---

### 🎫 Ticket #6: Add Error Display

**Priority:** Medium  
**Estimate:** 10 min  
**Status:** 🟢

**Tasks:**

- [ ] Create error message UI
- [ ] Add retry button
- [ ] Style error state

**Code:**

```typescript
// Add after search button
{
  error && (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-800 mb-2">❌ {error}</p>
      <button
        onClick={handleSearch}
        className="text-red-600 underline hover:text-red-800"
      >
        Try again
      </button>
    </div>
  );
}
```

---

## Hour 5: Display AI Response & Top Result

### 🎫 Ticket #7: Create ConversationalResponse Component

**Priority:** High  
**Estimate:** 15 min  
**Status:** 🟢

**Tasks:**

- [ ] Create `src/components/ConversationalResponse.tsx`
- [ ] Add props interface
- [ ] Style with Tailwind
- [ ] Export component

**Code:**

```typescript
// src/components/ConversationalResponse.tsx
interface ConversationalResponseProps {
  text: string;
}

export function ConversationalResponse({ text }: ConversationalResponseProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💬</span>
        <p className="text-gray-800 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
```

---

### 🎫 Ticket #8: Create TopRecommendation Component

**Priority:** High  
**Estimate:** 30 min  
**Status:** 🟢

**Tasks:**

- [ ] Create `src/components/TopRecommendation.tsx`
- [ ] Display smoothie name, category
- [ ] Show nutrition grid (4 macros)
- [ ] Add allergen badges
- [ ] Make responsive

**Code:**

```typescript
// src/components/TopRecommendation.tsx
import { Smoothie } from "@/types/smoothie";

interface TopRecommendationProps {
  smoothie: Smoothie;
}

export function TopRecommendation({ smoothie }: TopRecommendationProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {smoothie.name}
        </h2>
        <p className="text-blue-600 font-medium flex items-center gap-2">
          <span>📁</span>
          {smoothie.category}
        </p>
      </div>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Calories</p>
          <p className="text-3xl font-bold text-gray-900">
            {smoothie.nutrition_calories}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Protein</p>
          <p className="text-3xl font-bold text-blue-600">
            {smoothie.nutrition_protein}g
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Carbs</p>
          <p className="text-3xl font-bold text-green-600">
            {smoothie.nutrition_carbs}g
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Fat</p>
          <p className="text-3xl font-bold text-yellow-600">
            {smoothie.nutrition_fat}g
          </p>
        </div>
      </div>

      {/* Allergens */}
      {smoothie.allergens.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            <strong>Allergens:</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {smoothie.allergens.map((allergen) => (
              <span
                key={allergen}
                className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Serving Size */}
      <div className="mt-4 text-sm text-gray-600">
        <span className="font-medium">Serving Size:</span>{" "}
        {smoothie.nutritionSize}
      </div>
    </div>
  );
}
```

---

### 🎫 Ticket #9: Display Results in SearchPage

**Priority:** High  
**Estimate:** 15 min  
**Status:** 🟢

**Tasks:**

- [ ] Import components
- [ ] Add conditional rendering for results
- [ ] Add empty state message

**Code:**

```typescript
// Add to SearchPage after search input
import { ConversationalResponse } from "@/components/ConversationalResponse";
import { TopRecommendation } from "@/components/TopRecommendation";

// In return statement, after error div:
{
  results && (
    <div className="space-y-6">
      <ConversationalResponse text={results.aiResponse} />
      <TopRecommendation smoothie={results.topRecommendation} />
    </div>
  );
}

{
  !loading && !results && !error && (
    <div className="text-center py-12 text-gray-500">
      <p className="text-lg">
        🔍 Start by typing a question or describing what you're looking for
      </p>
    </div>
  );
}
```

---

## Hour 6: Alternative Results

### 🎫 Ticket #10: Create AlternativeCards Component

**Priority:** Medium  
**Estimate:** 25 min  
**Status:** 🟢

**Tasks:**

- [ ] Create `src/components/AlternativeCards.tsx`
- [ ] Display 2 alternative smoothies
- [ ] Show compact nutrition info
- [ ] Make cards clickable (future enhancement)

**Code:**

```typescript
// src/components/AlternativeCards.tsx
import { Smoothie } from "@/types/smoothie";

interface AlternativeCardsProps {
  smoothies: Smoothie[];
}

export function AlternativeCards({ smoothies }: AlternativeCardsProps) {
  // Show smoothies #2 and #3 (index 1 and 2)
  const alternatives = smoothies.slice(1, 3);

  if (alternatives.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>✨</span>
        Other Great Options
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alternatives.map((smoothie) => (
          <div
            key={smoothie.id}
            className="bg-white rounded-lg shadow p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <h4 className="font-bold text-lg text-gray-900 mb-2">
              {smoothie.name}
            </h4>
            <p className="text-sm text-gray-600 mb-3">{smoothie.category}</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">
                <strong>{smoothie.nutrition_calories}</strong> cal
              </span>
              <span className="text-blue-600">
                <strong>{smoothie.nutrition_protein}g</strong> protein
              </span>
            </div>
            {smoothie.allergens.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  ⚠️ {smoothie.allergens.join(", ")}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 🎫 Ticket #11: Add Loading Skeleton

**Priority:** Low  
**Estimate:** 15 min  
**Status:** 🟢

**Tasks:**

- [ ] Create loading skeleton UI
- [ ] Add pulsing animation
- [ ] Match layout of results

**Code:**

```typescript
// Add to SearchPage before results
{
  loading && (
    <div className="animate-pulse space-y-6">
      <div className="h-24 bg-gray-200 rounded-lg"></div>
      <div className="h-64 bg-gray-200 rounded-lg"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}
```

---

### 🎫 Ticket #12: Add AlternativeCards to SearchPage

**Priority:** Medium  
**Estimate:** 10 min  
**Status:** 🟢

**Code:**

```typescript
// Import
import { AlternativeCards } from "@/components/AlternativeCards";

// Add after TopRecommendation
<AlternativeCards smoothies={results.topThree} />;
```

---

## Hour 7: Basic Nutrition Display

### 🎫 Ticket #13: Create NutritionCard Component

**Priority:** High  
**Estimate:** 40 min  
**Status:** 🟢

**Tasks:**

- [ ] Create `src/components/NutritionCard.tsx`
- [ ] Implement FDA-style layout
- [ ] Add % Daily Value calculations
- [ ] Style with black borders
- [ ] Make responsive

**Code:**

```typescript
// src/components/NutritionCard.tsx
import { Smoothie } from "@/types/smoothie";

interface NutritionCardProps {
  smoothie: Smoothie;
}

export function NutritionCard({ smoothie }: NutritionCardProps) {
  // Calculate % Daily Values (based on 2000 cal diet)
  const dvProtein = Math.round((smoothie.nutrition_protein / 50) * 100);
  const dvCarbs = Math.round((smoothie.nutrition_carbs / 275) * 100);
  const dvFiber = Math.round((smoothie.nutrition_fiber / 28) * 100);
  const dvFat = Math.round((smoothie.nutrition_fat / 78) * 100);

  return (
    <div className="bg-white border-2 border-gray-900 rounded-lg p-6 max-w-sm mx-auto shadow-lg">
      {/* Header */}
      <div className="border-b-8 border-gray-900 pb-2 mb-2">
        <h3 className="text-3xl font-bold">Nutrition Facts</h3>
      </div>

      {/* Serving Size */}
      <p className="text-sm border-b-4 border-gray-900 pb-2 mb-2">
        Serving Size: <strong>{smoothie.nutritionSize}</strong>
      </p>

      {/* Calories */}
      <div className="border-b-8 border-gray-900 py-2 mb-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-bold">Amount Per Serving</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold">Calories</span>
          <span className="text-4xl font-bold">
            {smoothie.nutrition_calories}
          </span>
        </div>
      </div>

      {/* % Daily Value Header */}
      <div className="text-right text-sm font-bold border-b-4 border-gray-900 pb-1 mb-2">
        % Daily Value*
      </div>

      {/* Nutrients */}
      <div className="space-y-0 text-sm">
        {/* Total Fat */}
        <div className="flex justify-between border-b border-gray-400 py-2">
          <span className="font-bold">Total Fat {smoothie.nutrition_fat}g</span>
          <span className="font-bold">{dvFat}%</span>
        </div>

        {/* Total Carbohydrate */}
        <div className="flex justify-between border-b border-gray-400 py-2">
          <span className="font-bold">
            Total Carbohydrate {smoothie.nutrition_carbs}g
          </span>
          <span className="font-bold">{dvCarbs}%</span>
        </div>

        {/* Dietary Fiber (indented) */}
        <div className="flex justify-between border-b border-gray-400 py-2 pl-4">
          <span>Dietary Fiber {smoothie.nutrition_fiber}g</span>
          <span>{dvFiber}%</span>
        </div>

        {/* Total Sugars (indented, no %) */}
        <div className="flex justify-between border-b border-gray-400 py-2 pl-4">
          <span>Total Sugars {smoothie.nutrition_sugar}g</span>
        </div>

        {/* Protein */}
        <div className="flex justify-between border-b-4 border-gray-900 py-2">
          <span className="font-bold">
            Protein {smoothie.nutrition_protein}g
          </span>
          <span className="font-bold">{dvProtein}%</span>
        </div>
      </div>

      {/* Footnote */}
      <p className="text-xs mt-4 text-gray-700 leading-tight">
        *Percent Daily Values are based on a 2,000 calorie diet. Your daily
        values may be higher or lower depending on your calorie needs.
      </p>
    </div>
  );
}
```

---

### 🎫 Ticket #14: Add NutritionCard to SearchPage

**Priority:** High  
**Estimate:** 10 min  
**Status:** 🟢

**Code:**

```typescript
// Import
import { NutritionCard } from "@/components/NutritionCard";

// Add after TopRecommendation
<NutritionCard smoothie={results.topRecommendation} />;
```

---

## Hour 8: Deploy

### 🎫 Ticket #15: Pre-Deploy Testing

**Priority:** Critical  
**Estimate:** 15 min  
**Status:** 🟢

**Tasks:**

- [ ] Test 3-5 different queries locally
- [ ] Check mobile responsiveness (Chrome DevTools)
- [ ] Verify all components render
- [ ] Check for console errors

**Test Queries:**

- "high protein smoothie"
- "low calorie with strawberries"
- "post workout recovery"
- "vegan option"
- "something with pineapple"

---

### 🎫 Ticket #16: Commit to GitHub

**Priority:** Critical  
**Estimate:** 10 min  
**Status:** 🟢

**Tasks:**

```bash
git add .
git commit -m "feat: implement text-based search UI with nutrition display

- Add Tailwind CSS styling
- Create search page with text input
- Build ConversationalResponse component
- Build TopRecommendation component
- Build AlternativeCards component
- Build NutritionCard with FDA-style layout
- Add loading states and error handling
- Make fully responsive (mobile-first)"

git push origin main
```

---

### 🎫 Ticket #17: Deploy to Vercel

**Priority:** Critical  
**Estimate:** 20 min  
**Status:** 🟢

**Tasks:**

- [ ] Go to vercel.com and sign in
- [ ] Click "Add New Project"
- [ ] Import GitHub repository
- [ ] Configure environment variables:
  ```
  OPENAI_API_KEY=sk-...
  PINECONE_API_KEY=...
  PINECONE_INDEX_NAME=nutrition-information
  VOYAGE_API_KEY=...
  ```
- [ ] Click "Deploy"
- [ ] Wait for build to complete

---

### 🎫 Ticket #18: Production Testing

**Priority:** Critical  
**Estimate:** 15 min  
**Status:** 🟢

**Tasks:**

- [ ] Visit deployed URL
- [ ] Test same 5 queries from Ticket #15
- [ ] Test on real mobile device (scan QR code)
- [ ] Check browser console for errors
- [ ] Test slow 3G connection (Chrome DevTools)

---

### 🎫 Ticket #19: Take Screenshots

**Priority:** Medium  
**Estimate:** 10 min  
**Status:** 🟢

**Tasks:**

- [ ] Screenshot: Search interface (empty state)
- [ ] Screenshot: Search results with AI response
- [ ] Screenshot: Nutrition label closeup
- [ ] Screenshot: Mobile view
- [ ] Save to `screenshots/` folder

---

### 🎫 Ticket #20: Update README with Demo Link

**Priority:** Medium  
**Estimate:** 5 min  
**Status:** 🟢

**Code:**

```markdown
## 🌐 Live Demo

**Try it now:** [https://blendintel.vercel.app/search](https://your-actual-url.vercel.app/search)

### Screenshots

![Search Interface](screenshots/search-interface.png)
![Results Display](screenshots/results-display.png)
![Nutrition Label](screenshots/nutrition-label.png)
```

---

## 📊 Progress Tracker

### Completed Tickets: 0 / 20

**Hour 1-2 (Setup):**

- [ ] #1 Install Tailwind
- [ ] #2 TypeScript types
- [ ] #3 Search page route

**Hour 3-4 (API Integration):**

- [ ] #4 Search input
- [ ] #5 API call function
- [ ] #6 Error display

**Hour 5 (Results Display):**

- [ ] #7 ConversationalResponse
- [ ] #8 TopRecommendation
- [ ] #9 Display results

**Hour 6 (Alternatives):**

- [ ] #10 AlternativeCards
- [ ] #11 Loading skeleton
- [ ] #12 Add to page

**Hour 7 (Nutrition):**

- [ ] #13 NutritionCard
- [ ] #14 Add to page

**Hour 8 (Deploy):**

- [ ] #15 Pre-deploy testing
- [ ] #16 Git commit
- [ ] #17 Vercel deploy
- [ ] #18 Production testing
- [ ] #19 Screenshots
- [ ] #20 Update README

---

## 🎯 Success Criteria Checklist

By end of day, you can check off:

- [ ] Text search works end-to-end
- [ ] Results display in <2 seconds
- [ ] AI response shows
- [ ] Nutrition label renders
- [ ] Mobile responsive
- [ ] Deployed to Vercel
- [ ] Live URL shareable
- [ ] Screenshots taken

---

## 🚨 If You're Running Behind

**Skip if needed (can add tomorrow):**

- Ticket #11 (Loading skeleton) - nice to have
- Ticket #19 (Screenshots) - can do tomorrow
- Ticket #20 (README update) - can do later

**Cannot skip:**

- All Hour 1-2 tickets (foundation)
- Tickets #4, #5, #8 (core functionality)
- Tickets #17-18 (deployment)

**Priority order if cutting scope:**

1. Get search working → API integration
2. Display basic results → TopRecommendation
3. Add nutrition display → NutritionCard
4. Deploy → Share link
5. Everything else is polish

---

_Good luck! Update ticket status as you go (🟢 → 🟡 → ✅)_
