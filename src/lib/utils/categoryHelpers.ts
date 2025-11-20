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
