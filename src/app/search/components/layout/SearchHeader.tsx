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
