// Helper function to get category colors
export const getCategoryColor = (category: string) => {
  if (!category) return "bg-gray-100 text-gray-700 border-gray-200";

  const lower = category.toLowerCase();

  if (lower.includes("bowl")) {
    return "bg-purple-100 text-purple-700 border-purple-200";
  } else if (lower === "power eats") {
    return "bg-orange-100 text-orange-700 border-orange-200";
  } else if (lower.includes("fit") || lower.includes("protein")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  } else if (lower.includes("treat") || lower.includes("indulge")) {
    return "bg-pink-100 text-pink-700 border-pink-200";
  } else if (lower.includes("energize") || lower.includes("energy")) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  } else if (lower.includes("well") || lower.includes("immune")) {
    return "bg-green-100 text-green-700 border-green-200";
  } else if (lower.includes("slim") || lower.includes("weight")) {
    return "bg-teal-100 text-teal-700 border-teal-200";
  } else if (lower.includes("regular")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
};

// Helper function to get category emoji
export const getCategoryEmoji = (category: string) => {
  if (!category) return "🥤";

  const lower = category.toLowerCase();

  if (lower.includes("bowl")) return "🍓";
  if (lower === "power eats") return "💪";
  if (lower.includes("fit")) return "🏋️";
  if (lower.includes("protein")) return "💪";
  if (lower.includes("treat")) return "🍰";
  if (lower.includes("energize")) return "⚡";
  if (lower.includes("well") || lower.includes("immune")) return "🌿";
  if (lower.includes("slim") || lower.includes("weight")) return "🎯";
  if (lower.includes("regular")) return "🌾";

  return "🥤";
};
