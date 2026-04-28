export interface PredictionResult {
  area: string;
  mealsNeeded: number;
  urgency: 'Low' | 'Medium' | 'High';
  confidence: number;
  donorRadius: number;
  provider: string;
  recommendation: string;
}