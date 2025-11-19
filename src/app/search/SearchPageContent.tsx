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

export const SearchPageContent = () => {
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
};
