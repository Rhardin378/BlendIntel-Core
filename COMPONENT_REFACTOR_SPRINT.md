# 🏗️ Component Refactoring Sprint Plan

## 📋 Overview

**Goal:** Refactor the monolithic `SearchPageContent` component (~1000 lines) into smaller, reusable, maintainable components with proper state management using Context API.

**Duration:** 3 days (24 hours total)  
**Team Size:** 1 developer  
**Status:** 📝 Planning

---

## 🎯 Sprint Objectives

1. ✅ Extract UI components into logical, single-responsibility pieces
2. ✅ Implement Context API for shared state management
3. ✅ Improve testability with isolated components
4. ✅ Maintain 100% feature parity (zero breaking changes)
5. ✅ Improve developer experience and code navigation
6. ✅ Reduce bundle size through code splitting

---

## 🧠 Context vs Props Strategy

### When to Use Context

Use Context for:

- ✅ **Search state** (query, results, loading, error)
- ✅ **Category state** (current category, setCategory)
- ✅ **UI state** (showAllResults, expandedIngredients)
- ✅ **Actions** (handleSearch, resetSearch)

**Why Context?**

- Avoids prop drilling through 3-4+ component levels
- Centralized state management for search flow
- Easier to add new features without touching every component
- Better separation of concerns

### When to Use Props

Use Props for:

- ✅ **Pure display components** (NutritionGrid, AllergenBadges)
- ✅ **Reusable UI elements** (buttons, cards, badges)
- ✅ **Data transformation** (formatting utilities)

**Why Props?**

- Better testability (no context mocking)
- Explicit dependencies
- Easier to reuse across different contexts

---

## 📁 Proposed Component Structure

```
src/
├── app/
│   └── search/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── SearchHeader.tsx         # Header with logo + New Chat
│       │   │   ├── CategoryFilter.tsx       # Category pills (context)
│       │   │   └── SearchInput.tsx          # Bottom input (context)
│       │   ├── states/
│       │   │   ├── EmptyState.tsx           # Initial state with suggestions
│       │   │   ├── LoadingMessage.tsx       # AI loading animation
│       │   │   ├── ErrorMessage.tsx         # Error display
│       │   │   └── NoResultsMessage.tsx     # 0 results handling
│       │   ├── messages/
│       │   │   ├── ChatMessage.tsx          # User message bubble
│       │   │   ├── AIMessage.tsx            # AI response wrapper
│       │   │   └── AIResponseText.tsx       # Formatted AI text
│       │   ├── results/
│       │   │   ├── TopRecommendation.tsx    # Main result card
│       │   │   ├── AlternativeResults.tsx   # Collapsible alternatives
│       │   │   └── ResultCard.tsx           # Individual result item
│       │   ├── shared/
│       │   │   ├── NutritionGrid.tsx        # 4-col macro display (pure)
│       │   │   ├── CategoryBadge.tsx        # Category pill (pure)
│       │   │   ├── AllergenBadges.tsx       # Allergen warnings (pure)
│       │   │   ├── IngredientsSection.tsx   # Collapsible ingredients
│       │   │   ├── ShareButton.tsx          # Share functionality
│       │   │   └── SuggestionChips.tsx      # Quick action buttons
│       │   └── index.ts                     # Barrel exports
│       ├── hooks/
│       │   ├── useSearch.ts                 # Search context hook
│       │   └── useURLSync.ts                # URL state sync
│       ├── page.tsx                         # Main orchestration
│       └── layout.tsx
├── contexts/
│   └── SearchContext.tsx                    # Global search state
└── lib/
    └── utils/
        ├── categoryHelpers.ts               # Category colors/emojis
        └── textFormatting.ts                # Bold parsing, etc.
```

---

## 🗓️ Day-by-Day Plan

### Day 1: Foundation & Context (8 hours)

#### Morning (4 hours)

**Task 1.1: Create SearchContext** ⏱️ 2 hours  
**Priority:** Critical  
**Complexity:** Medium

Create the central state management context:

```typescript
// src/contexts/SearchContext.tsx

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchResponse } from "@/app/types/menuItem";
import { trackSearch } from "@/lib/analytics";

type CategoryType = "all" | "smoothies" | "bowls" | "power-eats";

interface SearchContextType {
  // State
  query: string;
  inputValue: string;
  category: CategoryType;
  isLoading: boolean;
  results: SearchResponse | null;
  error: string | null;
  showAllResults: boolean;
  expandedIngredients: Set<string>;

  // Setters
  setQuery: (query: string) => void;
  setInputValue: (value: string) => void;
  setCategory: (category: CategoryType) => void;
  setResults: (results: SearchResponse | null) => void;
  setError: (error: string | null) => void;
  setShowAllResults: (show: boolean) => void;

  // Actions
  handleSearch: () => Promise<void>;
  toggleIngredients: (id: string) => void;
  resetSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [query, setQuery] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [category, setCategory] = useState<CategoryType>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllResults, setShowAllResults] = useState<boolean>(false);
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(
    new Set()
  );

  // URL sync effect
  useEffect(() => {
    const urlCat = searchParams.get("cat") as CategoryType | null;
    const urlQ = searchParams.get("q") || null;

    if (
      urlCat &&
      ["all", "smoothies", "bowls", "power-eats"].includes(urlCat)
    ) {
      setCategory(urlCat);
    } else {
      const saved = localStorage.getItem(
        "blendintel.category"
      ) as CategoryType | null;
      if (saved) setCategory(saved);
    }

    if (urlQ) {
      setQuery(urlQ);
      setInputValue(urlQ);
      // Auto-search logic here
    }
  }, []);

  // Category persistence
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("blendintel.category", category);
    }
  }, [category]);

  // Actions
  const handleSearch = useCallback(async () => {
    const startTime = Date.now();
    if (!inputValue.trim()) return;

    setQuery(inputValue.trim());
    setInputValue("");
    setIsLoading(true);
    setError(null);
    setShowAllResults(false);

    const params = new URLSearchParams();
    params.set("q", inputValue.trim());
    params.set("cat", category);
    router.replace(`/search?${params.toString()}`);

    try {
      const response = await fetch("/api/nutritionSearchRerank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: inputValue.trim(),
          topK: 10,
          category,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          const retryMinutes = Math.ceil(data.retryAfter / 60);
          throw new Error(
            `You've reached the demo limit. Please try again in ${retryMinutes} minutes. Thanks for trying BlendIntel!`
          );
        }
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      setResults(data);

      trackSearch(
        inputValue.trim(),
        category,
        data.total,
        Date.now() - startTime
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      trackSearch(inputValue.trim(), category, 0, Date.now() - startTime);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, category, router]);

  const toggleIngredients = useCallback((id: string) => {
    setExpandedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const resetSearch = useCallback(() => {
    setResults(null);
    setQuery("");
    setInputValue("");
    setError(null);
    setShowAllResults(false);
    setExpandedIngredients(new Set());
    router.replace("/search");
  }, [router]);

  return (
    <SearchContext.Provider
      value={{
        query,
        inputValue,
        category,
        isLoading,
        results,
        error,
        showAllResults,
        expandedIngredients,
        setQuery,
        setInputValue,
        setCategory,
        setResults,
        setError,
        setShowAllResults,
        handleSearch,
        toggleIngredients,
        resetSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return context;
}
```

**Acceptance Criteria:**

- [ ] Context exports all necessary state and actions
- [ ] URL sync logic moved from component to context
- [ ] localStorage persistence handled in context
- [ ] Custom hook with proper error handling

---

**Task 1.2: Create Utility Helpers** ⏱️ 1 hour  
**Priority:** High  
**Complexity:** Low

Extract helper functions into utilities:

```typescript
// src/lib/utils/textFormatting.ts

export function parseBoldMarkdown(text: string) {
  return text.split(/(\*\*.*?\*\*)/).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return {
        type: "bold" as const,
        content: part.slice(2, -2),
        key: i,
      };
    }
    return {
      type: "text" as const,
      content: part,
      key: i,
    };
  });
}

export function splitParagraphs(text: string) {
  return text.split("\n\n").filter((p) => p.trim());
}

export function isNumberedList(paragraph: string) {
  return /^\d+\./.test(paragraph.trim());
}
```

```typescript
// src/app/utils/categoryHelpers.ts (already exists, just verify)

export function getCategoryColor(category: string | undefined | null): string {
  if (!category) return "bg-gray-100 text-gray-700 border-gray-200";

  const lower = category.toLowerCase();

  if (lower.includes("bowl")) {
    return "bg-purple-100 text-purple-700 border-purple-200";
  } else if (lower === "power eats") {
    return "bg-orange-100 text-orange-700 border-orange-200";
  }
  return "bg-blue-100 text-blue-700 border-blue-200";
}

export function getCategoryEmoji(category: string | undefined | null): string {
  if (!category) return "🥤";

  const lower = category.toLowerCase();

  if (lower.includes("bowl")) return "🍓";
  if (lower === "power eats") return "💪";
  return "🥤";
}
```

**Acceptance Criteria:**

- [ ] Text formatting utilities tested with sample data
- [ ] Category helpers handle edge cases
- [ ] All utilities are pure functions

---

**Task 1.3: Update Main Page to Use Context** ⏱️ 1 hour  
**Priority:** Critical  
**Complexity:** Low

```typescript
// src/app/search/page.tsx

import { Suspense } from "react";
import { SearchProvider } from "@/contexts/SearchContext";
import SearchPageContent from "./SearchPageContent";

export default function SearchPage() {
  return (
    <SearchProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchPageContent />
      </Suspense>
    </SearchProvider>
  );
}
```

**Acceptance Criteria:**

- [ ] Context provider wraps page content
- [ ] Suspense boundary in place for useSearchParams
- [ ] No functionality broken

---

#### Afternoon (4 hours)

**Task 1.4: Extract Layout Components** ⏱️ 2 hours  
**Priority:** High  
**Complexity:** Low

Create header, category filter, and input components:

```typescript
// src/app/search/components/layout/SearchHeader.tsx

import Image from "next/image";
import { useSearch } from "@/contexts/SearchContext";

export function SearchHeader() {
  const { resetSearch } = useSearch();

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Image
            src="/smoothie-king-logo.svg"
            alt="BlendIntel"
            width={32}
            height={32}
          />
          <h1 className="text-xl font-semibold text-gray-900">BlendIntel</h1>
        </div>
        <button
          onClick={resetSearch}
          className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          New Chat
        </button>
      </div>
    </header>
  );
}
```

```typescript
// src/app/search/components/layout/CategoryFilter.tsx

import { useSearch } from "@/contexts/SearchContext";

type CategoryType = "all" | "smoothies" | "bowls" | "power-eats";

const CATEGORIES: { value: CategoryType; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "⭐" },
  { value: "smoothies", label: "Smoothies", emoji: "🥤" },
  { value: "bowls", label: "Bowls", emoji: "🍓" },
  { value: "power-eats", label: "Power Eats", emoji: "💪" },
];

export function CategoryFilter() {
  const { category, setCategory } = useSearch();

  return (
    <div className="flex gap-2 items-center overflow-x-auto pb-1 px-4">
      <span className="text-sm text-gray-600 font-medium mr-1 flex-shrink-0">
        Search:
      </span>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => setCategory(cat.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
            category === cat.value
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}
```

```typescript
// src/app/search/components/layout/SearchInput.tsx

import Image from "next/image";
import { useSearch } from "@/contexts/SearchContext";

export function SearchInput() {
  const { inputValue, setInputValue, handleSearch, isLoading, category } =
    useSearch();

  const placeholder = {
    all: "Search all menu items...",
    smoothies: "Search smoothies...",
    bowls: "Search bowls...",
    "power-eats": "Search power eats...",
  }[category];

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4 sticky bottom-0">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading && inputValue.trim()) {
                    handleSearch();
                  }
                }
              }}
              placeholder={placeholder}
              rows={1}
              className="w-full px-4 py-3 text-[15px] border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !inputValue.trim()}
            className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {isLoading ? (
              <Image
                src="/smoothie-king-logo.svg"
                alt="Loading"
                width={20}
                height={20}
                className="animate-spin"
              />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          BlendIntel can make mistakes. Check nutrition facts.
        </p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**

- [ ] Header renders with reset functionality
- [ ] Category filter updates context
- [ ] Input handles keyboard events
- [ ] All components use context instead of props

---

**Task 1.5: Create Barrel Exports** ⏱️ 30 min  
**Priority:** Medium  
**Complexity:** Low

```typescript
// src/app/search/components/layout/index.ts
export { SearchHeader } from "./SearchHeader";
export { CategoryFilter } from "./CategoryFilter";
export { SearchInput } from "./SearchInput";
```

**Acceptance Criteria:**

- [ ] Clean import paths in parent components
- [ ] TypeScript types properly exported

---

**Task 1.6: Testing & Documentation** ⏱️ 1.5 hours  
**Priority:** High  
**Complexity:** Low

Create component documentation:

```markdown
// src/app/search/components/README.md

# Search Components Architecture

## Context Usage

The `SearchContext` provides centralized state management for:

- Search query and input values
- Category selection
- Loading and error states
- Results and UI state (expanded items, show all)
- Actions (search, reset, toggle)

### When to Use Context vs Props

**Use Context for:**

- Components that need search state (query, results, loading)
- Components that trigger actions (search, reset, category change)
- Deep nested components that would require prop drilling

**Use Props for:**

- Pure presentational components (NutritionGrid, Badges)
- Components with simple, isolated data
- Reusable UI elements

## Component Hierarchy
```

SearchPage (Context Provider)
├── SearchHeader (context: resetSearch)
├── CategoryFilter (context: category, setCategory)
├── Main Content Area
│ ├── EmptyState (context: category, setInputValue)
│ ├── LoadingMessage (context: category)
│ ├── ErrorMessage (props: message)
│ └── AIResponse (context: results, showAllResults, etc.)
└── SearchInput (context: inputValue, handleSearch, isLoading)

```

## Testing Strategy

### Context Testing
- Mock SearchProvider for component tests
- Test state updates and actions
- Verify URL sync and localStorage

### Component Testing
- Test pure components with props only
- Test context consumers with mocked context
- Integration tests for user flows
```

**Acceptance Criteria:**

- [ ] Documentation covers architecture decisions
- [ ] Context vs props strategy documented
- [ ] Component hierarchy visualized

---

### Day 2: State & Message Components (8 hours)

#### Morning (4 hours)

**Task 2.1: Extract State Components** ⏱️ 2.5 hours  
**Priority:** High  
**Complexity:** Medium

```typescript
// src/app/search/components/states/EmptyState.tsx

import Image from "next/image";
import { useSearch } from "@/contexts/SearchContext";

const SUGGESTIONS = {
  all: [
    {
      emoji: "💪",
      text: "High protein",
      query: "High protein with strawberries",
    },
    { emoji: "🏃", text: "Post-workout", query: "Low calorie post-workout" },
    { emoji: "🌱", text: "Vegan option", query: "Vegan under 300 calories" },
  ],
  smoothies: [
    { emoji: "💪", text: "High protein", query: "High protein smoothie" },
    { emoji: "🏃", text: "Low calorie", query: "Low calorie fruit smoothie" },
    { emoji: "🍍", text: "Tropical", query: "Something with pineapple" },
  ],
  bowls: [
    { emoji: "🍓", text: "Berry bowl", query: "Bowl with berries" },
    { emoji: "🌾", text: "High fiber", query: "High fiber breakfast bowl" },
    { emoji: "🥜", text: "PB bowl", query: "Bowl with peanut butter" },
  ],
  "power-eats": [
    { emoji: "💪", text: "High protein", query: "High protein breakfast" },
    { emoji: "⚡", text: "Quick snack", query: "Quick protein snack" },
    { emoji: "🍞", text: "Toast", query: "Healthy toast option" },
  ],
};

export function EmptyState() {
  const { category, setInputValue } = useSearch();

  const suggestions = SUGGESTIONS[category];
  const categoryLabel =
    category === "all" ? "menu item" : category.replace("-", " ");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="mb-8">
        <Image
          src="/smoothie-king-logo.svg"
          alt="BlendIntel"
          width={80}
          height={80}
          className="opacity-20"
        />
      </div>

      <h2 className="text-3xl font-semibold text-gray-900 mb-3">
        What are you looking for?
      </h2>

      <p className="text-gray-600 mb-2 max-w-md">
        Ask me anything about nutrition, ingredients, or find the perfect{" "}
        {categoryLabel} for your goals
      </p>

      <div className="mb-8 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
        <span className="text-sm font-medium text-blue-700">
          {category === "all" && "⭐ Searching all menu items"}
          {category === "smoothies" && "🥤 Searching smoothies only"}
          {category === "bowls" && "🍓 Searching bowls only"}
          {category === "power-eats" && "💪 Searching power eats only"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => setInputValue(suggestion.query)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
          >
            {suggestion.emoji} {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// src/app/search/components/states/LoadingMessage.tsx

import Image from "next/image";
import { useSearch } from "@/contexts/SearchContext";

export function LoadingMessage() {
  const { category } = useSearch();

  const categoryLabel = {
    all: "all items",
    smoothies: "smoothies",
    bowls: "bowls",
    "power-eats": "power eats",
  }[category];

  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        <Image
          src="/smoothie-king-logo.svg"
          alt="AI"
          width={20}
          height={20}
          className="brightness-0 invert"
        />
      </div>
      <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-tl-sm px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></span>
          </div>
          <span className="text-sm text-gray-600">
            Searching {categoryLabel}...
          </span>
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/app/search/components/states/ErrorMessage.tsx

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        ⚠️
      </div>
      <div className="max-w-[80%] bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-5 py-3">
        <p className="text-[15px] text-red-800">{message}</p>
      </div>
    </div>
  );
}
```

```typescript
// src/app/search/components/states/NoResultsMessage.tsx

import { useSearch } from "@/contexts/SearchContext";

export function NoResultsMessage() {
  const { query, category, setCategory } = useSearch();

  const categoryLabel =
    category === "all" ? "items" : category.replace("-", " ");

  return (
    <div className="flex gap-3 w-full mt-4">
      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
        🤔
      </div>
      <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-gray-800 text-sm mb-2">
          No {categoryLabel} found for &ldquo;{query}&rdquo;.
        </p>
        <div className="flex flex-wrap gap-2">
          {category !== "all" && (
            <button
              onClick={() => setCategory("all")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Search all categories →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**

- [ ] EmptyState shows category-specific suggestions
- [ ] LoadingMessage animates smoothly
- [ ] ErrorMessage displays all error types
- [ ] NoResultsMessage handles edge cases

---

**Task 2.2: Extract Message Components** ⏱️ 1.5 hours  
**Priority:** High  
**Complexity:** Low

```typescript
// src/app/search/components/messages/ChatMessage.tsx

interface ChatMessageProps {
  text: string;
}

export function ChatMessage({ text }: ChatMessageProps) {
  return (
    <div className="flex gap-4 justify-end">
      <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3">
        <p className="text-[15px]">{text}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        👤
      </div>
    </div>
  );
}
```

```typescript
// src/app/search/components/messages/AIResponseText.tsx

import {
  parseBoldMarkdown,
  splitParagraphs,
  isNumberedList,
} from "@/lib/utils/textFormatting";

interface AIResponseTextProps {
  text: string;
}

export function AIResponseText({ text }: AIResponseTextProps) {
  const paragraphs = splitParagraphs(text);

  return (
    <div className="space-y-3 mb-4">
      {paragraphs.map((paragraph, idx) => {
        const parts = parseBoldMarkdown(paragraph);

        if (isNumberedList(paragraph)) {
          return (
            <div
              key={idx}
              className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500"
            >
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                {parts.map((part) =>
                  part.type === "bold" ? (
                    <strong
                      key={part.key}
                      className="font-semibold text-gray-900"
                    >
                      {part.content}
                    </strong>
                  ) : (
                    <span key={part.key}>{part.content}</span>
                  )
                )}
              </p>
            </div>
          );
        }

        return (
          <p key={idx} className="text-gray-700 text-sm leading-relaxed">
            {parts.map((part) =>
              part.type === "bold" ? (
                <strong key={part.key} className="font-semibold text-gray-900">
                  {part.content}
                </strong>
              ) : (
                <span key={part.key}>{part.content}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}
```

**Acceptance Criteria:**

- [ ] ChatMessage displays user queries
- [ ] AIResponseText parses bold markdown
- [ ] Numbered lists styled with blue border

---

#### Afternoon (4 hours)

**Task 2.3: Extract Pure Display Components** ⏱️ 2 hours  
**Priority:** High  
**Complexity:** Low

```typescript
// src/app/search/components/shared/NutritionGrid.tsx

interface NutritionGridProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function NutritionGrid({
  calories,
  protein,
  carbs,
  fat,
}: NutritionGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      <div className="text-center">
        <p className="text-xs text-gray-600 mb-1">Calories</p>
        <p className="text-lg font-bold text-gray-900">{calories}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-600 mb-1">Protein</p>
        <p className="text-lg font-bold text-blue-600">{protein}g</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-600 mb-1">Carbs</p>
        <p className="text-lg font-bold text-green-600">{carbs}g</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-600 mb-1">Fat</p>
        <p className="text-lg font-bold text-yellow-600">{fat}g</p>
      </div>
    </div>
  );
}
```

```typescript
// src/app/search/components/shared/CategoryBadge.tsx

import {
  getCategoryColor,
  getCategoryEmoji,
} from "@/app/utils/categoryHelpers";

interface CategoryBadgeProps {
  category: string;
  size?: string;
}

export function CategoryBadge({ category, size }: CategoryBadgeProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryColor(
          category
        )}`}
      >
        {getCategoryEmoji(category)} {category}
      </span>
      {size && <span className="text-xs text-gray-500">{size}</span>}
    </div>
  );
}
```

```typescript
// src/app/search/components/shared/AllergenBadges.tsx

interface AllergenBadgesProps {
  allergens: string[];
}

export function AllergenBadges({ allergens }: AllergenBadgesProps) {
  if (!allergens || allergens.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
      {allergens.map((allergen) => (
        <span
          key={allergen}
          className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-200"
        >
          ⚠️ {allergen}
        </span>
      ))}
    </div>
  );
}
```

```typescript
// src/app/search/components/shared/IngredientsSection.tsx

interface IngredientsSectionProps {
  ingredients: string[];
  id: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export function IngredientsSection({
  ingredients,
  id,
  isExpanded,
  onToggle,
}: IngredientsSectionProps) {
  if (!ingredients || ingredients.length === 0) return null;

  return (
    <div className="pt-3 border-t border-gray-200">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        <span className="flex items-center gap-2">
          🥣 Ingredients ({ingredients.length})
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-2 text-sm text-gray-600 leading-relaxed animate-slideIn">
          {ingredients.join(", ")}
        </div>
      )}
    </div>
  );
}
```

```typescript
// src/app/search/components/shared/ShareButton.tsx

interface ShareButtonProps {
  itemName: string;
  category: string;
}

export function ShareButton({ itemName, category }: ShareButtonProps) {
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `BlendIntel - ${itemName}`,
          text: `Check out this ${category}: ${itemName}`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
      <button
        onClick={handleShare}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        Share results
      </button>
      <span className="text-xs text-gray-500">Demo • Limited searches</span>
    </div>
  );
}
```

**Acceptance Criteria:**

- [ ] All components are pure (props only)
- [ ] Proper TypeScript interfaces
- [ ] Handle edge cases (empty arrays, undefined)
- [ ] Consistent styling

---

**Task 2.4: Create Component Index Files** ⏱️ 30 min  
**Priority:** Low  
**Complexity:** Low

```typescript
// src/app/search/components/states/index.ts
export { EmptyState } from "./EmptyState";
export { LoadingMessage } from "./LoadingMessage";
export { ErrorMessage } from "./ErrorMessage";
export { NoResultsMessage } from "./NoResultsMessage";

// src/app/search/components/messages/index.ts
export { ChatMessage } from "./ChatMessage";
export { AIResponseText } from "./AIResponseText";

// src/app/search/components/shared/index.ts
export { NutritionGrid } from "./NutritionGrid";
export { CategoryBadge } from "./CategoryBadge";
export { AllergenBadges } from "./AllergenBadges";
export { IngredientsSection } from "./IngredientsSection";
export { ShareButton } from "./ShareButton";
```

---

**Task 2.5: Refactor Main Content Area** ⏱️ 1.5 hours  
**Priority:** Critical  
**Complexity:** Medium

Update SearchPageContent to use new components:

```typescript
// src/app/search/SearchPageContent.tsx

"use client";

import { useSearch } from "@/contexts/SearchContext";
import { SearchHeader, CategoryFilter, SearchInput } from "./components/layout";
import {
  EmptyState,
  LoadingMessage,
  ErrorMessage,
  NoResultsMessage,
} from "./components/states";
import { ChatMessage } from "./components/messages";
import { AIResponse } from "./components/results";

export default function SearchPageContent() {
  const { query, results, isLoading, error } = useSearch();

  return (
    <div className="flex flex-col h-screen bg-white">
      <SearchHeader />
      <CategoryFilter />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Empty state */}
          {!results && !isLoading && !error && <EmptyState />}

          {/* Chat messages */}
          {(results || isLoading || error) && (
            <div className="space-y-6">
              {/* User message */}
              {query && <ChatMessage text={query} />}

              {/* Loading */}
              {isLoading && <LoadingMessage />}

              {/* Error */}
              {error && <ErrorMessage message={error} />}

              {/* No results */}
              {results && !isLoading && results.total === 0 && (
                <NoResultsMessage />
              )}

              {/* Results */}
              {results && !isLoading && results.total > 0 && <AIResponse />}
            </div>
          )}
        </div>
      </main>

      <SearchInput />
    </div>
  );
}
```

**Acceptance Criteria:**

- [ ] All state conditions handled
- [ ] Components render correctly
- [ ] No duplicate code
- [ ] Maintains all functionality

---

### Day 3: Result Components & Polish (8 hours)

#### Morning (4 hours)

**Task 3.1: Extract Result Components** ⏱️ 3 hours  
**Priority:** Critical  
**Complexity:** High

```typescript
// src/app/search/components/results/TopRecommendation.tsx

import { useSearch } from "@/contexts/SearchContext";
import { CategoryBadge } from "../shared/CategoryBadge";
import { NutritionGrid } from "../shared/NutritionGrid";
import { AllergenBadges } from "../shared/AllergenBadges";
import { IngredientsSection } from "../shared/IngredientsSection";
import { ShareButton } from "../shared/ShareButton";

export function TopRecommendation() {
  const { results, expandedIngredients, toggleIngredients } = useSearch();

  if (!results) return null;

  const item = results.topRecommendation;

  return (
    <>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        🏆 Top Recommendation
      </p>

      <CategoryBadge category={item.category} size={item.nutritionSize} />

      <h3 className="font-semibold text-lg text-gray-900 mb-3">{item.name}</h3>

      <NutritionGrid
        calories={item.nutrition_calories}
        protein={item.nutrition_protein}
        carbs={item.nutrition_carbs}
        fat={item.nutrition_fat}
      />

      <AllergenBadges allergens={item.allergens || []} />

      <IngredientsSection
        ingredients={item.ingredients || []}
        id={item.id}
        isExpanded={expandedIngredients.has(item.id)}
        onToggle={toggleIngredients}
      />

      <ShareButton itemName={item.name} category={item.category} />
    </>
  );
}
```

```typescript
// src/app/search/components/results/ResultCard.tsx

import {
  getCategoryColor,
  getCategoryEmoji,
} from "@/app/utils/categoryHelpers";
import { IngredientsSection } from "../shared/IngredientsSection";

interface ResultCardProps {
  item: {
    id: string;
    name: string;
    category: string;
    nutritionSize?: string;
    nutrition_calories: number;
    nutrition_protein: number;
    nutrition_carbs: number;
    nutrition_fat: number;
    allergens?: string[];
    ingredients?: string[];
  };
  rank: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export function ResultCard({
  item,
  rank,
  isExpanded,
  onToggle,
}: ResultCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors animate-slideIn">
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getCategoryColor(
            item.category
          )}`}
        >
          {getCategoryEmoji(item.category)} {item.category}
        </span>
        <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
          #{rank}
        </span>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>

      {item.nutritionSize && (
        <p className="text-xs text-gray-600 mb-2">{item.nutritionSize}</p>
      )}

      <div className="flex flex-wrap gap-2 text-sm mb-3">
        <span className="bg-white px-2 py-1 rounded border border-gray-200">
          ⚡ {item.nutrition_calories} cal
        </span>
        <span className="bg-white px-2 py-1 rounded border border-gray-200">
          💪 {item.nutrition_protein}g protein
        </span>
        <span className="bg-white px-2 py-1 rounded border border-gray-200">
          🍞 {item.nutrition_carbs}g carbs
        </span>
      </div>

      {item.allergens && item.allergens.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.allergens.map((allergen) => (
            <span
              key={allergen}
              className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-200"
            >
              ⚠️ {allergen}
            </span>
          ))}
        </div>
      )}

      <IngredientsSection
        ingredients={item.ingredients || []}
        id={item.id}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
    </div>
  );
}
```

```typescript
// src/app/search/components/results/AlternativeResults.tsx

import { useSearch } from "@/contexts/SearchContext";
import { ResultCard } from "./ResultCard";

export function AlternativeResults() {
  const { results, showAllResults, expandedIngredients, toggleIngredients } =
    useSearch();

  if (!results || !showAllResults) return null;

  const alternatives = results.topFive.slice(1); // Exclude top recommendation

  if (alternatives.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm font-medium text-gray-600 mb-3">
        📋 Other Options ({alternatives.length})
      </p>
      {alternatives.map((item, idx) => (
        <ResultCard
          key={item.id}
          item={item}
          rank={idx + 2}
          isExpanded={expandedIngredients.has(item.id)}
          onToggle={toggleIngredients}
        />
      ))}
    </div>
  );
}
```

```typescript
// src/app/search/components/results/AIResponse.tsx

import Image from "next/image";
import { useSearch } from "@/contexts/SearchContext";
import { AIResponseText } from "../messages/AIResponseText";
import { TopRecommendation } from "./TopRecommendation";
import { AlternativeResults } from "./AlternativeResults";

export function AIResponse() {
  const { results, showAllResults, setShowAllResults } = useSearch();

  if (!results) return null;

  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
        <Image
          src="/smoothie-king-logo.svg"
          alt="AI"
          width={20}
          height={20}
          className="brightness-0 invert"
        />
      </div>
      <div className="flex-1 max-w-[80%]">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <AIResponseText text={results.aiResponse} />

          <div className="border-t border-gray-200 mb-4"></div>

          <TopRecommendation />

          {results.topFive.length > 1 && (
            <button
              onClick={() => setShowAllResults(!showAllResults)}
              className="w-full mt-3 pt-3 border-t border-gray-200 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {showAllResults ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                  Hide other options
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  Show {results.topFive.length - 1} more option{results.topFive.length - 1 > 1 ? "s" : ""}
                </>
              )}
            </button>
          )}

          <AlternativeResults />
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**

- [ ] TopRecommendation displays correctly
- [ ] ResultCard shows all nutrition info
- [ ] AlternativeResults expands/collapses
- [ ] AIResponse orchestrates all result components

---

**Task 3.2: Create Results Index** ⏱️ 15 min  
**Priority:** Low  
**Complexity:** Low

```typescript
// src/app/search/components/results/index.ts
export { AIResponse } from "./AIResponse";
export { TopRecommendation } from "./TopRecommendation";
export { ResultCard } from "./ResultCard";
export { AlternativeResults } from "./AlternativeResults";
```

---

**Task 3.3: Final Integration Testing** ⏱️ 45 min  
**Priority:** Critical  
**Complexity:** Low

Manual testing checklist:

- [ ] Search flow works end-to-end
- [ ] Category filtering works
- [ ] URL state persists
- [ ] Share button works
- [ ] Ingredients expand/collapse
- [ ] Alternative results show/hide
- [ ] Error states display
- [ ] Loading states animate
- [ ] Empty state suggestions work
- [ ] Mobile responsive

---

#### Afternoon (4 hours)

**Task 3.4: Performance Optimization** ⏱️ 2 hours  
**Priority:** Medium  
**Complexity:** Medium

```typescript
// Memoize expensive components
import { memo } from "react";

export const NutritionGrid = memo(function NutritionGrid({
  calories,
  protein,
  carbs,
  fat,
}) {
  // ... component code
});

export const ResultCard = memo(function ResultCard({
  item,
  rank,
  isExpanded,
  onToggle,
}) {
  // ... component code
});
```

```typescript
// Add useCallback to context actions
const handleSearch = useCallback(async () => {
  // ... existing code
}, [inputValue, category, router]);

const toggleIngredients = useCallback((id: string) => {
  setExpandedIngredients((prev) => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
}, []);
```

**Acceptance Criteria:**

- [ ] Memoized pure components
- [ ] Context actions use useCallback
- [ ] No unnecessary re-renders
- [ ] Bundle size analyzed

---

**Task 3.5: Code Cleanup & Linting** ⏱️ 1 hour  
**Priority:** Medium  
**Complexity:** Low

- [ ] Remove old monolithic component
- [ ] Fix all ESLint warnings
- [ ] Format all files with Prettier
- [ ] Remove unused imports
- [ ] Verify TypeScript types

---

**Task 3.6: Update Documentation** ⏱️ 1 hour  
**Priority:** Medium  
**Complexity:** Low

```markdown
// Update main README.md

## Component Architecture

BlendIntel uses a modular component architecture with centralized state management:

### State Management

- **Context API** for global search state
- **Local State** for UI-only concerns
- **URL Sync** for shareable search results

### Component Structure

- `/components/layout` - Page structure (header, filter, input)
- `/components/states` - Loading, error, empty states
- `/components/messages` - Chat bubbles and AI responses
- `/components/results` - Search result cards
- `/components/shared` - Reusable UI components

### Adding New Components

1. Determine if state comes from Context or props
2. Create component in appropriate directory
3. Add to barrel export
4. Test in isolation
5. Integrate into page

See `COMPONENT_REFACTOR_SPRINT.md` for detailed architecture decisions.
```

---

## 📊 Success Metrics

### Code Quality

- ✅ Reduced average component size from 1000 lines to <200 lines
- ✅ Separation of concerns (context vs props)
- ✅ Improved testability (isolated components)
- ✅ Better code navigation (logical folder structure)

### Developer Experience

- ✅ Faster feature development
- ✅ Easier onboarding for new developers
- ✅ Clear component responsibilities
- ✅ Reusable components

### Performance

- ✅ Reduced bundle size through code splitting
- ✅ Memoized expensive components
- ✅ Optimized re-renders with useCallback
- ✅ Lazy loading opportunities

---

## 🚨 Risk Management

### Risks

1. **Breaking Changes** - Components may not render correctly
2. **State Bugs** - Context state updates may cause issues
3. **Performance** - More components = more overhead
4. **Time Overrun** - Complex refactoring may take longer

### Mitigation

1. **Incremental Approach** - Extract one component at a time
2. **Comprehensive Testing** - Test each component as extracted
3. **Git Branches** - Use feature branches, can revert if needed
4. **Performance Monitoring** - Measure before/after metrics

---

## 📝 Post-Sprint Review

### Retrospective Questions

- What went well?
- What could be improved?
- What did we learn about Context API?
- How can we improve component architecture?

### Next Steps

- Add unit tests for components
- Add Storybook for component documentation
- Consider adding E2E tests
- Monitor production performance

---

## 🎯 Definition of Done

A component is "done" when:

- [ ] Implemented with proper TypeScript types
- [ ] Uses Context or Props appropriately
- [ ] Handles edge cases (empty, null, undefined)
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] Responsive design (mobile-first)
- [ ] Code reviewed
- [ ] Manually tested
- [ ] Documentation updated

The sprint is "done" when:

- [ ] All components extracted and working
- [ ] Context API implemented
- [ ] All features working (100% parity)
- [ ] Performance metrics acceptable
- [ ] Documentation complete
- [ ] Code merged to main branch

---

**Good luck with your refactoring sprint! 🚀**
