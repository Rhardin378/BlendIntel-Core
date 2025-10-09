export const customizationRules = {
  gladiator: {
    baseMaxIngredients: 2,
    sizeMultipliers: {
      "small(20 oz)": 1.0,
      "medium(32 oz)": 1.5,
      "large(44 oz)": 2.0,
    },
    baseProtein: {
      affectedByMultiplier: false, // The base protein doesn't change with size
    },
    addOns: {
      affectedByMultiplier: true, // Add-ons DO scale with size
      maxAddOns: 2,
      description:
        "Add-ons scale with smoothie size: 1x for small, 1.5x for medium, and 2x for large.",
    },
  },
};
