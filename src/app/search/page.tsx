import { Suspense } from "react";
import { SearchProvider } from "@/contexts/SearchContext";
import { SearchPageContent } from "./SearchPageContent";

export default function SearchPage() {
  return (
    <SearchProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchPageContent />
      </Suspense>
    </SearchProvider>
  );
}
