'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Brain,
  Loader2,
  MapPin,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

type PredictionData = {
  area: string;
  mealsNeeded: number;
  urgency: 'Low' | 'Medium' | 'High';
  confidence: number;
  donorRadius: number;
  provider: string;
  recommendation: string;
};

export default function AIPredictionPanel() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PredictionData | null>(null);
  const [error, setError] = useState('');

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || 'Failed to predict');

      setData(json);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, []);

  const urgencyColor =
    data?.urgency === 'High'
      ? 'bg-red-500'
      : data?.urgency === 'Medium'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="size-5 text-emerald-600" />
              AI Hunger Forecast
            </CardTitle>

            <CardDescription>
              Predictive intelligence for food demand & shortage response
            </CardDescription>
          </div>

          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
            <Sparkles className="size-3 mr-1" />
            Live AI
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-emerald-600" />
            <p>Analyzing city demand patterns...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <AlertTriangle className="size-4" />
              {error}
            </div>

            <Button onClick={fetchPrediction} size="sm">
              Retry
            </Button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Top Grid */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-white border p-4">
                <p className="text-xs text-muted-foreground mb-1">High Risk Area</p>
                <p className="font-semibold flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-600" />
                  {data.area}
                </p>
              </div>

              <div className="rounded-xl bg-white border p-4">
                <p className="text-xs text-muted-foreground mb-1">Meals Needed</p>
                <p className="font-semibold text-xl">{data.mealsNeeded}</p>
              </div>

              <div className="rounded-xl bg-white border p-4">
                <p className="text-xs text-muted-foreground mb-1">Urgency</p>
                <Badge className={`${urgencyColor} text-white`}>
                  {data.urgency}
                </Badge>
              </div>

              <div className="rounded-xl bg-white border p-4">
                <p className="text-xs text-muted-foreground mb-1">Donor Radius</p>
                <p className="font-semibold">{data.donorRadius} km</p>
              </div>
            </div>

            {/* Confidence */}
            <div className="rounded-xl bg-white border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Prediction Confidence
                </span>
                <span className="font-medium">{data.confidence}%</span>
              </div>

              <Progress value={data.confidence} className="h-2" />
            </div>

            {/* Recommendation */}
            <div className="rounded-xl border bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-100 p-2">
                  <TrendingUp className="size-4 text-emerald-600" />
                </div>

                <div>
                  <p className="font-medium">AI Recommendation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="size-4" />
                Notify nearby donors & NGOs now
              </div>

              <Badge variant="outline">
                Powered by {data.provider}
              </Badge>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}