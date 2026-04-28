export type PredictionInput = {
  area: string;
  pastRequests: number;
  pastDonations: number;
  volunteersAvailable: number;
  hour: number;
  isWeekend: boolean;
};

export function predictFoodDemand(data: PredictionInput) {
  let score = 0;

  // More requests = more demand
  score += data.pastRequests * 2;

  // More donations reduce demand pressure
  score -= data.pastDonations * 1.2;

  // Volunteers help response
  score -= data.volunteersAvailable * 0.8;

  // Evening meal demand
  if (data.hour >= 18 && data.hour <= 22) score += 10;

  // Weekend demand pattern
  if (data.isWeekend) score += 6;

  if (score < 0) score = 0;

  const predictedMeals = Math.round(score + 20);

  let risk = "Low";
  if (predictedMeals > 80) risk = "High";
  else if (predictedMeals > 45) risk = "Medium";

  return {
    area: data.area,
    predictedMeals,
    risk,
    suggestedRadiusKm: risk === "High" ? 5 : risk === "Medium" ? 3 : 2,
  };
}