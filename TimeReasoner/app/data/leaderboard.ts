export type Metric = "MSE" | "MAE";

export const DOMAINS = [
  "Electricity",
  "Environment",
  "Economy",
  "Energy",
  "Healthcare",
] as const;

export type Domain = (typeof DOMAINS)[number];

export const DATASETS = [
  { id: "ETTh1", label: "ETTh1", domain: "Electricity", horizon: 96 },
  { id: "ETTh2", label: "ETTh2", domain: "Electricity", horizon: 96 },
  { id: "ETTm1", label: "ETTm1", domain: "Electricity", horizon: 96 },
  { id: "ETTm2", label: "ETTm2", domain: "Electricity", horizon: 96 },
  { id: "Exchange", label: "Exchange", domain: "Economy", horizon: 96 },
  { id: "AQWan", label: "AQWan", domain: "Environment", horizon: 96 },
  {
    id: "AQShunyi",
    label: "AQShunyi",
    domain: "Environment",
    horizon: 96,
  },
  { id: "Wind", label: "Wind", domain: "Energy", horizon: 96 },
  { id: "NASDAQ", label: "NASDAQ", domain: "Economy", horizon: 36 },
  { id: "VitalDB", label: "VitalDB", domain: "Healthcare", horizon: 200 },
] as const satisfies readonly {
  id: string;
  label: string;
  domain: Domain;
  horizon: number;
}[];

export type DatasetId = (typeof DATASETS)[number]["id"];

export type ModelResult = {
  name: string;
  family: string;
  scores: Record<Metric, readonly number[]>;
};

export const MODEL_RESULTS = [
  {
    name: "DLinear",
    family: "Deep learning",
    scores: {
      MSE: [
        7.7656, 10.3584, 14.0352, 7.8604, 0.0014, 21090.0523, 21077.8247,
        1617.3343, 0.0007, 68.2254,
      ],
      MAE: [
        1.4981, 2.0567, 1.7591, 1.8981, 0.0253, 51.1701, 50.5644,
        18.3691, 0.0215, 6.7148,
      ],
    },
  },
  {
    name: "PatchTST",
    family: "Deep learning",
    scores: {
      MSE: [
        9.243, 10.9489, 16.3988, 5.6375, 0.0009, 12528.5571, 16747.3794,
        2013.9736, 0.0007, 50.7402,
      ],
      MAE: [
        1.65, 1.993, 1.9294, 1.3834, 0.0198, 39.8232, 42.0165, 20.1837,
        0.0211, 5.6983,
      ],
    },
  },
  {
    name: "iTransformer",
    family: "Deep learning",
    scores: {
      MSE: [
        7.5195, 9.9716, 12.7432, 5.7392, 0.001, 13577.9277, 18147.8075,
        1600.0376, 0.0008, 79.2864,
      ],
      MAE: [
        1.4983, 1.901, 1.6374, 1.4422, 0.0202, 39.8069, 42.7643, 17.9244,
        0.0235, 7.3322,
      ],
    },
  },
  {
    name: "TimeXer",
    family: "Deep learning",
    scores: {
      MSE: [
        8.4878, 11.4123, 14.0473, 5.5801, 0.0009, 14509.0913, 16505.3908,
        1668.6824, 0.0007, 65.8567,
      ],
      MAE: [
        1.543, 2.0606, 1.7534, 1.4238, 0.0193, 41.2693, 40.9784, 18.2386,
        0.023, 6.1253,
      ],
    },
  },
  {
    name: "GPT4TS",
    family: "LLM-based",
    scores: {
      MSE: [
        6.9454, 9.7156, 15.9028, 5.6327, 0.0009, 13543.6153, 16821.9321,
        1786.3085, 0.001, 65.3715,
      ],
      MAE: [
        1.4127, 1.8891, 1.9364, 1.4743, 0.02, 39.7527, 41.8708, 18.2427,
        0.0253, 6.7207,
      ],
    },
  },
  {
    name: "Time-LLM",
    family: "LLM-based",
    scores: {
      MSE: [
        6.8152, 9.9876, 15.8078, 5.6787, 0.001, 13405.9845, 16678.0982,
        1773.9651, 0.0011, 65.9761,
      ],
      MAE: [
        1.4115, 1.888, 1.935, 1.4733, 0.0199, 39.7481, 41.8598, 18.2365,
        0.0252, 6.7151,
      ],
    },
  },
  {
    name: "LLMTime",
    family: "LLM-based",
    scores: {
      MSE: [
        10.6261, 11.2011, 14.6394, 6.9001, 0.0026, 29141.5143, 30266.3043,
        3979.7996, 0.0021, 99.5761,
      ],
      MAE: [
        1.6987, 1.5876, 1.9543, 1.5109, 0.0345, 65.6789, 60.3456, 30.1234,
        0.0234, 8.9054,
      ],
    },
  },
  {
    name: "Chronos",
    family: "Foundation model",
    scores: {
      MSE: [
        10.6328, 15.2152, 22.7706, 9.6567, 0.0103, 13858.3941, 16601.0443,
        2874.5295, 0.0043, 50.2799,
      ],
      MAE: [
        1.5128, 2.1104, 2.2046, 1.7979, 0.0324, 42.7446, 45.1168, 23.1097,
        0.0341, 5.7185,
      ],
    },
  },
  {
    name: "Moirai",
    family: "Foundation model",
    scores: {
      MSE: [
        10.5981, 11.9302, 38.5828, 10.4213, 0.0008, 14864.1762, 19450.7758,
        2279.2915, 0.0009, 180.8878,
      ],
      MAE: [
        1.569, 1.9536, 2.7939, 1.7779, 0.0182, 42.0587, 44.1069, 20.0049,
        0.0245, 10.6444,
      ],
    },
  },
  {
    name: "MOMENT",
    family: "Foundation model",
    scores: {
      MSE: [
        18.31, 12.1693, 26.2155, 8.1986, 0.0012, 14687.9019, 15596.0312,
        1726.4521, 0.0006, 73.3861,
      ],
      MAE: [
        2.3847, 2.1208, 2.8222, 1.7389, 0.0223, 43.5303, 43.4243, 20.0301,
        0.0201, 6.8837,
      ],
    },
  },
  {
    name: "TimeReasoner",
    family: "Reasoning LLM",
    scores: {
      MSE: [
        5.4469, 8.602, 14.2055, 6.4384, 0.0009, 11305.6345, 12874.9412,
        1556.5316, 0.0008, 79.489,
      ],
      MAE: [
        1.1984, 1.6811, 1.6984, 1.4209, 0.0168, 36.1614, 37.0193, 17.5034,
        0.0215, 6.9735,
      ],
    },
  },
] as const satisfies readonly ModelResult[];

export type RankedModel = {
  model: ModelResult;
  meanRank: number;
  wins: number;
  datasetRanks: Record<string, number>;
  values: Record<string, number>;
};

export function formatScore(value: number) {
  return value.toFixed(4);
}

export function rankModels(
  metric: Metric,
  selectedDatasetIds: readonly string[],
): RankedModel[] {
  const selectedDatasets = DATASETS.filter((dataset) =>
    selectedDatasetIds.includes(dataset.id),
  );

  if (selectedDatasets.length === 0) {
    return [];
  }

  const rankMaps = new Map<string, Map<string, number>>();

  for (const dataset of selectedDatasets) {
    const datasetIndex = DATASETS.findIndex((item) => item.id === dataset.id);
    const sorted = MODEL_RESULTS.map((model) => ({
      name: model.name,
      value: model.scores[metric][datasetIndex],
    })).sort((a, b) => a.value - b.value || a.name.localeCompare(b.name));

    let previousValue: number | undefined;
    let currentRank = 0;
    const modelRanks = new Map<string, number>();

    sorted.forEach((entry, index) => {
      if (previousValue === undefined || entry.value !== previousValue) {
        currentRank = index + 1;
        previousValue = entry.value;
      }
      modelRanks.set(entry.name, currentRank);
    });

    rankMaps.set(dataset.id, modelRanks);
  }

  return MODEL_RESULTS.map((model) => {
    const datasetRanks: Record<string, number> = {};
    const values: Record<string, number> = {};

    for (const dataset of selectedDatasets) {
      const datasetIndex = DATASETS.findIndex((item) => item.id === dataset.id);
      datasetRanks[dataset.id] =
        rankMaps.get(dataset.id)?.get(model.name) ?? MODEL_RESULTS.length;
      values[dataset.id] = model.scores[metric][datasetIndex];
    }

    const ranks = Object.values(datasetRanks);
    const meanRank = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
    const wins = ranks.filter((rank) => rank === 1).length;

    return {
      model,
      meanRank,
      wins,
      datasetRanks,
      values,
    };
  }).sort(
    (a, b) =>
      a.meanRank - b.meanRank ||
      b.wins - a.wins ||
      a.model.name.localeCompare(b.model.name),
  );
}
