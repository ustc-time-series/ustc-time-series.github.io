"use client";

import { useMemo, useState } from "react";
import {
  DATASETS,
  DOMAINS,
  formatScore,
  rankModels,
  type DatasetId,
  type Domain,
  type Metric,
} from "../data/leaderboard";

const ALL_DATASET_IDS = DATASETS.map((dataset) => dataset.id);

type DatasetScope = "All" | Domain | "Custom";

export function LeaderboardExplorer() {
  const [metric, setMetric] = useState<Metric>("MSE");
  const [activeScope, setActiveScope] = useState<DatasetScope>("All");
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<DatasetId[]>([
    ...ALL_DATASET_IDS,
  ]);

  const selectedDatasets = DATASETS.filter((dataset) =>
    selectedDatasetIds.includes(dataset.id),
  );
  const rankedModels = useMemo(
    () => rankModels(metric, selectedDatasetIds),
    [metric, selectedDatasetIds],
  );

  function applyScope(scope: Exclude<DatasetScope, "Custom">) {
    const nextDatasetIds =
      scope === "All"
        ? [...ALL_DATASET_IDS]
        : DATASETS.filter((dataset) => dataset.domain === scope).map(
            (dataset) => dataset.id,
          );

    setActiveScope(scope);
    setSelectedDatasetIds(nextDatasetIds);
  }

  function toggleDataset(datasetId: DatasetId) {
    setActiveScope("Custom");
    setSelectedDatasetIds((current) =>
      current.includes(datasetId)
        ? current.filter((id) => id !== datasetId)
        : [...current, datasetId],
    );
  }

  function selectAllDatasets() {
    setActiveScope("All");
    setSelectedDatasetIds([...ALL_DATASET_IDS]);
  }

  function clearDatasets() {
    setActiveScope("Custom");
    setSelectedDatasetIds([]);
  }

  return (
    <section className="leaderboard-explorer" aria-labelledby="filters-title">
      <div className="leaderboard-filter-panel">
        <div className="filter-heading">
          <div>
            <p className="eyebrow">Interactive comparison</p>
            <h2 id="filters-title">Choose evaluation conditions</h2>
          </div>
          <p>Lower is better for both reported metrics.</p>
        </div>

        <div className="leaderboard-controls">
          <fieldset className="metric-fieldset">
            <legend>Metric</legend>
            <div className="segmented-control">
              {(["MSE", "MAE"] as const).map((option) => (
                <button
                  aria-pressed={metric === option}
                  className="metric-button"
                  key={option}
                  onClick={() => setMetric(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="scope-fieldset">
            <legend>Dataset scope</legend>
            <div className="scope-presets">
              {(["All", ...DOMAINS] as const).map((scope) => (
                <button
                  aria-pressed={activeScope === scope}
                  key={scope}
                  onClick={() => applyScope(scope)}
                  type="button"
                >
                  {scope}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="dataset-fieldset">
            <div className="dataset-fieldset-heading">
              <legend>Datasets</legend>
              <div className="dataset-actions">
                <button onClick={selectAllDatasets} type="button">
                  Select all
                </button>
                <button onClick={clearDatasets} type="button">
                  Clear
                </button>
              </div>
            </div>
            <div className="dataset-chips">
              {DATASETS.map((dataset) => (
                <button
                  aria-pressed={selectedDatasetIds.includes(dataset.id)}
                  className="dataset-chip"
                  key={dataset.id}
                  onClick={() => toggleDataset(dataset.id)}
                  type="button"
                >
                  <span>{dataset.label}</span>
                  <small>H={dataset.horizon}</small>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {rankedModels.length === 0 ? (
        <div className="leaderboard-empty" aria-live="polite">
          <h3>No datasets selected</h3>
          <p>Select at least one dataset to calculate the model ranking.</p>
          <button
            className="pill-button"
            onClick={selectAllDatasets}
            type="button"
          >
            Select all datasets
          </button>
        </div>
      ) : (
        <>
          <div className="leaderboard-summary" aria-live="polite">
            <p>
              Ranking <strong>{rankedModels.length} models</strong> across{" "}
              <strong>{selectedDatasets.length} datasets</strong> by average{" "}
              {metric} rank.
            </p>
            <p>
              Current leader: <strong>{rankedModels[0].model.name}</strong>
            </p>
          </div>

          <div
            className="table-scroll leaderboard-table-scroll"
            role="region"
            aria-label={`${metric} model leaderboard`}
            tabIndex={0}
          >
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Model</th>
                  <th>Average rank</th>
                  <th>Wins</th>
                  {selectedDatasets.map((dataset) => (
                    <th key={dataset.id}>
                      <span>{dataset.label}</span>
                      <small>H={dataset.horizon}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rankedModels.map((entry, index) => (
                  <tr
                    className={
                      entry.model.name === "TimeReasoner"
                        ? "timereasoner-row"
                        : undefined
                    }
                    key={entry.model.name}
                  >
                    <td className="overall-rank">{index + 1}</td>
                    <td className="model-cell">
                      <strong>{entry.model.name}</strong>
                      <small>{entry.model.family}</small>
                    </td>
                    <td className="average-rank">
                      {entry.meanRank.toFixed(2)}
                    </td>
                    <td>{entry.wins}</td>
                    {selectedDatasets.map((dataset) => (
                      <td className="score-cell" key={dataset.id}>
                        <span>{formatScore(entry.values[dataset.id])}</span>
                        <small>#{entry.datasetRanks[dataset.id]}</small>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
