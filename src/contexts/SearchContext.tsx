"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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
      // Auto-search if we have a query from URL
      const autoSearch = async () => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/nutritionSearchRerank", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: urlQ,
              topK: 10,
              category: urlCat || category,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setResults(data);
          }
        } catch (err) {
          console.error("Auto-search failed:", err);
        } finally {
          setIsLoading(false);
        }
      };

      autoSearch();
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
