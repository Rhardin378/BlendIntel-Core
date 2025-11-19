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
