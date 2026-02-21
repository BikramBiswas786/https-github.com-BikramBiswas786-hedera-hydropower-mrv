'use strict';

/**
 * Isolation Forest — Pure JavaScript Implementation
 * Zero external dependencies. Works in any Node.js >= 18 environment.
 *
 * Reference:
 *   Liu, Fei Tony, Kai Ming Ting, and Zhi-Hua Zhou.
 *   "Isolation forest." ICDM 2008.
 *   https://doi.org/10.1109/ICDM.2008.17
 *
 * How it works:
 *   1. Build N random isolation trees from subsamples of training data.
 *   2. Each tree isolates every point by repeatedly selecting a random
 *      feature and a random split value between that feature's min/max.
 *   3. Anomalies are isolated faster (shorter average path length).
 *   4. Anomaly score = 2^(-E[h(x)] / c(n))  where c(n) is the average
 *      path length of an unsuccessful BST search.
 */

const EULER_MASCHERONI = 0.5772156649;

/**
 * Average path length of unsuccessful binary search tree search.
 * Used to normalise scores across different subsample sizes.
 * @param {number} n - Number of points
 * @returns {number}
 */
function averagePathLength(n) {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  return 2.0 * (Math.log(n - 1) + EULER_MASCHERONI) - (2.0 * (n - 1) / n);
}

/**
 * Build a single isolation tree recursively.
 * @param {number[][]} data  - Feature vectors
 * @param {number}     depth - Current depth
 * @param {number}     maxDepth - Maximum allowed depth
 * @returns {object} Tree node
 */
function buildTree(data, depth, maxDepth) {
  const n = data.length;

  if (n <= 1 || depth >= maxDepth) {
    return { isLeaf: true, size: n };
  }

  const nFeatures = data[0].length;

  // Select a random feature that has variance
  let featureIdx, minVal, maxVal, attempts = 0;
  do {
    featureIdx = Math.floor(Math.random() * nFeatures);
    const vals = data.map(d => d[featureIdx]);
    minVal = Math.min(...vals);
    maxVal = Math.max(...vals);
    attempts++;
  } while (minVal === maxVal && attempts < nFeatures * 2);

  // All features constant — treat as leaf
  if (minVal === maxVal) {
    return { isLeaf: true, size: n };
  }

  // Random split in [min, max)
  const splitValue = minVal + Math.random() * (maxVal - minVal);

  const leftData  = data.filter(d => d[featureIdx] <  splitValue);
  const rightData = data.filter(d => d[featureIdx] >= splitValue);

  return {
    isLeaf: false,
    featureIdx,
    splitValue,
    left:  buildTree(leftData,  depth + 1, maxDepth),
    right: buildTree(rightData, depth + 1, maxDepth)
  };
}

/**
 * Compute path length for a sample through one tree.
 * @param {object}   node   - Tree node
 * @param {number[]} sample - Feature vector
 * @param {number}   depth  - Current depth
 * @returns {number}
 */
function computePathLength(node, sample, depth) {
  if (node.isLeaf) {
    return depth + averagePathLength(node.size);
  }
  if (sample[node.featureIdx] < node.splitValue) {
    return computePathLength(node.left,  sample, depth + 1);
  }
  return computePathLength(node.right, sample, depth + 1);
}

// ─────────────────────────────────────────────

class IsolationForest {
  /**
   * @param {object} options
   * @param {number} options.nTrees       Number of trees          (default 100)
   * @param {number} options.sampleSize   Subsample per tree       (default 256)
   * @param {number} options.contamination Fraction of anomalies   (default 0.10)
   * @param {string[]} options.featureNames Optional feature labels
   */
  constructor(options = {}) {
    this.nTrees       = options.nTrees        || 100;
    this.sampleSize   = options.sampleSize    || 256;
    this.contamination= options.contamination || 0.10;
    this.featureNames = options.featureNames  || null;
    this.trees        = [];
    this.trained      = false;
    this.trainingSize = 0;
    this.threshold    = 0.5;  // updated after fit()
  }

  /**
   * Train the forest.
   * @param {number[][]} data - Array of normalised feature vectors.
   * @returns {IsolationForest} this (chainable)
   */
  fit(data) {
    if (!data || data.length === 0) {
      throw new Error('[IsolationForest] fit() called with empty data');
    }

    this.trainingSize  = data.length;
    const actualSample = Math.min(this.sampleSize, data.length);
    const maxDepth     = Math.ceil(Math.log2(actualSample)) + 1;

    this.trees = [];

    for (let t = 0; t < this.nTrees; t++) {
      // Random subsample (Fisher-Yates shuffle then slice)
      const shuffled = data.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const sample = shuffled.slice(0, actualSample);
      this.trees.push(buildTree(sample, 0, maxDepth));
    }

    // Calibrate threshold using training scores
    const scores = data.map(x => this._rawAnomalyScore(x)).sort((a, b) => a - b);
    const threshIdx = Math.min(
      Math.floor(scores.length * (1 - this.contamination)),
      scores.length - 1
    );
    this.threshold = scores[threshIdx];
    this.trained   = true;

    return this;
  }

  /**
   * Raw anomaly score ∈ [0,1].  Values near 1 indicate anomalies.
   */
  _rawAnomalyScore(sample) {
    if (this.trees.length === 0) return 0;
    const avgPath  = this.trees.reduce((s, t) => s + computePathLength(t, sample, 0), 0)
                     / this.trees.length;
    const norm     = averagePathLength(Math.min(this.sampleSize, this.trainingSize));
    return Math.pow(2, -avgPath / (norm || 1));
  }

  /**
   * Score a single sample.
   * @param {number[]} sample - Normalised feature vector
   * @returns {{ score, isAnomaly, confidence, threshold }}
   */
  score(sample) {
    if (!this.trained) throw new Error('[IsolationForest] Call fit() before score()');
    const raw       = this._rawAnomalyScore(sample);
    const isAnomaly = raw > this.threshold;
    const confidence = Math.min(1, Math.abs(raw - 0.5) * 2);
    return {
      score:      parseFloat(raw.toFixed(6)),
      isAnomaly,
      confidence: parseFloat(confidence.toFixed(4)),
      threshold:  parseFloat(this.threshold.toFixed(6))
    };
  }

  /** Score many samples at once. */
  scoreMany(samples) {
    return samples.map(s => this.score(s));
  }

  /** Serialize to plain JSON (save to disk or Hedera HCS). */
  toJSON() {
    return {
      version:       '1.0',
      algorithm:     'IsolationForest',
      nTrees:        this.nTrees,
      sampleSize:    this.sampleSize,
      contamination: this.contamination,
      featureNames:  this.featureNames,
      trained:       this.trained,
      trainingSize:  this.trainingSize,
      threshold:     this.threshold,
      trees:         this.trees
    };
  }

  /** Restore from serialised JSON. */
  static fromJSON(json) {
    const m = new IsolationForest({
      nTrees:       json.nTrees,
      sampleSize:   json.sampleSize,
      contamination:json.contamination,
      featureNames: json.featureNames
    });
    m.trees        = json.trees;
    m.trained      = json.trained;
    m.trainingSize = json.trainingSize;
    m.threshold    = json.threshold;
    return m;
  }
}

module.exports = { IsolationForest, averagePathLength, computePathLength };
