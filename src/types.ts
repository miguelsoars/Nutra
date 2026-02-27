export interface User {
  id: string;
  username: string;
}

export interface WeightRecord {
  weight: number;
  date: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  birthDate: string;
  height: string;
  weight: string;
  gender: 'M' | 'F';
  goal: 'emagrecer' | 'manter' | 'hipertrofia';
  activity: 'sedentario' | 'leve' | 'moderado' | 'intenso';
  avatar?: string;
  estimatedBF?: number;
  tdee?: number;
  bodyType?: string;
  bodyTypeInfluence?: string;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  dietStrategy?: {
    strategy: string;
    explanation: string;
    recommendedFoods: string[];
    recommendedTargets?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  lastStrategyUpdate?: number;
  weightHistory: WeightRecord[];
}

export interface DiaryEntry {
  id: number;
  time: string;
  date: string;
  timestamp: number;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  items: {
    name: string;
    weight: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}
