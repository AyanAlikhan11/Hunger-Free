import { askGrok } from "./grok";

export async function getPrediction() {
  try {
    const raw = await askGrok("Predict hunger demand in JSON");

    const match = raw.match(/\{[\s\S]*\}/);

    if (!match) throw new Error();

    const parsed = JSON.parse(match[0]);

    return {
      ...parsed,
      provider: "Grok AI",
    };
  } catch {
    return {
      area: "North Kolkata",
      mealsNeeded: 120,
      urgency: "High",
      confidence: 88,
      donorRadius: 5,
      recommendation:
        "Notify nearby donors immediately.",
      provider: "Fallback",
    };
  }
}