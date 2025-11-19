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
