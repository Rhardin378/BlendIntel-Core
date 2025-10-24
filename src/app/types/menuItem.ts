export interface MenuItem {
  id: string;
  score?: number;
  rerankedScore?: number;
  name: string;
  category: string;
  servingSize: string;
  allergens: string[];
  ingredients: string[];
  availableSizes: [];
  nutrition_calories: number;
  nutrition_protein: number;
  nutrition_carbs: number;
  nutrition_fat: number;
  nutrition_sugar: number;
  nutrition_fiber: number;
}

export interface SearchResponse {
  query: string;
  topRecommendation: MenuItem;
  topFive: MenuItem[];
  allResults: MenuItem[];
  aiResponse: string;
  reranked: boolean;
  total: number;
}
