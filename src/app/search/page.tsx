"use client";
import { Suspense } from "react";
import { SearchProvider } from "@/contexts/SearchContext";
import { SearchPageContent } from "./SearchPageContent";

export const dynamic = "force-dynamic";
export const runtime = "edge"; // Optional: Use edge runtime for faster cold starts

function SearchLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading search...</p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchProvider>
        <SearchPageContent />
      </SearchProvider>
    </Suspense>
  );
}
