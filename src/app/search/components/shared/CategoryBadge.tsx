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
