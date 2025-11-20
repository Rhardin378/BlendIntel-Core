interface AllergenBadgesProps {
  allergens: string[];
}

export function AllergenBadges({ allergens }: AllergenBadgesProps) {
  if (!allergens || allergens.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
      {allergens.map((allergen) => (
        <span
          key={allergen}
          className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-200"
        >
          ⚠️ {allergen}
        </span>
      ))}
    </div>
  );
}
