"use client";

import { useState } from "react";

export default function AIPredictionCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runPrediction() {
    setLoading(true);

    const res = await fetch("/api/ai/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        area: "Kolkata Central",
        pastRequests: 52,
        pastDonations: 18,
        volunteersAvailable: 5,
        hour: new Date().getHours(),
        isWeekend: [0, 6].includes(new Date().getDay()),
      }),
    });

    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  return (
    <div className="p-6 rounded-2xl border bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        Smart Hunger Prediction
      </h2>

      <button
        onClick={runPrediction}
        className="px-4 py-2 rounded-xl bg-green-600 text-white"
      >
        {loading ? "Analyzing..." : "Run AI"}
      </button>

      {data && (
        <div className="mt-4 space-y-2 text-sm">
          <p><strong>Provider:</strong> {data.provider}</p>
          <p><strong>Risk:</strong> {data.riskLevel}</p>
          <p><strong>Meals Needed:</strong> {data.predictedMealsNeeded}</p>
          <p><strong>Reason:</strong> {data.reason}</p>
          <p><strong>Action:</strong> {data.recommendedAction}</p>
        </div>
      )}
    </div>
  );
}