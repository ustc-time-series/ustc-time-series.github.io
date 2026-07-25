import assert from "node:assert/strict";
import test from "node:test";

import {
  DATASETS,
  MODEL_RESULTS,
  formatScore,
  rankModels,
} from "../app/data/leaderboard.ts";

test("contains the complete Table 2 score matrix", () => {
  assert.equal(DATASETS.length, 10);
  assert.equal(MODEL_RESULTS.length, 11);
  assert.deepEqual(
    DATASETS.map((dataset) => dataset.id),
    [
      "ETTh1",
      "ETTh2",
      "ETTm1",
      "ETTm2",
      "Exchange",
      "AQWan",
      "AQShunyi",
      "Wind",
      "NASDAQ",
      "VitalDB",
    ],
  );

  const scoreCount = MODEL_RESULTS.reduce(
    (total, model) =>
      total + model.scores.MSE.length + model.scores.MAE.length,
    0,
  );
  assert.equal(scoreCount, 220);

  for (const model of MODEL_RESULTS) {
    assert.equal(model.scores.MSE.length, DATASETS.length);
    assert.equal(model.scores.MAE.length, DATASETS.length);
  }
});

test("preserves anchor values reported in the paper", () => {
  const timeReasoner = MODEL_RESULTS.find(
    (model) => model.name === "TimeReasoner",
  );
  const patchTST = MODEL_RESULTS.find((model) => model.name === "PatchTST");
  const moirai = MODEL_RESULTS.find((model) => model.name === "Moirai");

  assert.ok(timeReasoner);
  assert.ok(patchTST);
  assert.ok(moirai);
  assert.equal(timeReasoner.scores.MSE[0], 5.4469);
  assert.equal(timeReasoner.scores.MAE[9], 6.9735);
  assert.equal(patchTST.scores.MSE[5], 12528.5571);
  assert.equal(moirai.scores.MSE[4], 0.0008);
});

test("ranks lower scores first and preserves reported ties", () => {
  const etth1 = rankModels("MSE", ["ETTh1"]);
  assert.equal(etth1[0].model.name, "TimeReasoner");
  assert.equal(etth1[0].meanRank, 1);
  assert.equal(etth1[0].wins, 1);

  const nasdaq = rankModels("MSE", ["NASDAQ"]);
  assert.equal(nasdaq[0].model.name, "MOMENT");
  assert.equal(nasdaq[0].datasetRanks.NASDAQ, 1);

  for (const modelName of ["DLinear", "PatchTST", "TimeXer"]) {
    const result = nasdaq.find((entry) => entry.model.name === modelName);
    assert.equal(result?.datasetRanks.NASDAQ, 2);
  }
});

test("averages only selected dataset ranks and handles an empty scope", () => {
  const selected = rankModels("MAE", ["ETTh1", "ETTh2"]);
  assert.equal(selected[0].model.name, "TimeReasoner");
  assert.equal(selected[0].meanRank, 1.5);
  assert.deepEqual(
    Object.keys(selected[0].datasetRanks),
    ["ETTh1", "ETTh2"],
  );

  assert.deepEqual(rankModels("MSE", []), []);
  assert.deepEqual(rankModels("MSE", ["unknown"]), []);
});

test("formats paper scores with four decimal places", () => {
  assert.equal(formatScore(0.0008), "0.0008");
  assert.equal(formatScore(5.4469), "5.4469");
  assert.equal(formatScore(11305.6345), "11305.6345");
});
