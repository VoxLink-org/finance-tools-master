interface MarketIndicator {
  score: number;
  rating: string;
  classification: string;
}

interface RSIAnalysis {
  value: number;
  status: string;
  divergence: string;
}

interface VIXAnalysis {
  current: number;
  trend: string;
  fromWeekAgo: number;
  monthlyRange: {
    low: number;
    high: number;
  };
  sentiment: string;
}

interface MarketData {
  fearAndGreedIndex: MarketIndicator;
  spyRSI14Day: RSIAnalysis;
  qqqRSI14Day: RSIAnalysis;
  spyRSI6Day: RSIAnalysis;
  qqqRSI6Day: RSIAnalysis;
  vixAnalysis: VIXAnalysis;
  timestamp: string;
}

const marketData: MarketData = {
  fearAndGreedIndex: {
    score: 66,
    rating: "greed",
    classification: "Greed"
  },
  spyRSI14Day: {
    value: 61.4,
    status: "neutral",
    divergence: "no_clear_divergence"
  },
  qqqRSI14Day: {
    value: 65.7,
    status: "neutral",
    divergence: "no_clear_divergence"
  },
  spyRSI6Day: {
    value: 61.8,
    status: "neutral",
    divergence: "no_clear_divergence"
  },
  qqqRSI6Day: {
    value: 68.0,
    status: "neutral",
    divergence: "no_clear_divergence"
  },
  vixAnalysis: {
    current: 19.06,
    trend: "falling",
    fromWeekAgo: 20.87,
    monthlyRange: {
      low: 17.24,
      high: 25.15
    },
    sentiment: "neutral"
  },
  timestamp: "2025-05-29T00:49:35Z"
};

export type { MarketIndicator, RSIAnalysis, VIXAnalysis, MarketData };
export { marketData };