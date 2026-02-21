'use strict';

/**
 * Generate synthetic training data and save to data/synthetic-training.json
 *
 * Usage:
 *   node scripts/generate-training-data.js
 *   node scripts/generate-training-data.js --samples=10000
 */

const fs   = require('fs');
const path = require('path');
const { generateDataset } = require('../src/ml/SyntheticDataGenerator');

const args       = process.argv.slice(2);
const samplesArg = args.find(a => a.startsWith('--samples='));
const N          = samplesArg ? parseInt(samplesArg.split('=')[1], 10) : 5000;

console.log(`Generating ${N} synthetic hydropower readings...`);
const dataset = generateDataset(N);

const counts = dataset.reduce((acc, d) => {
  acc[d.label] = (acc[d.label] || 0) + 1;
  return acc;
}, {});

console.log('Label distribution:');
for (const [label, count] of Object.entries(counts)) {
  console.log(`  ${label}: ${count} (${((count/N)*100).toFixed(1)}%)`);
}

const outDir  = path.join(__dirname, '../data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'synthetic-training.json');
fs.writeFileSync(outPath, JSON.stringify(dataset, null, 2));

const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`\n✅ Saved ${N} samples to ${outPath} (${kb} KB)`);
console.log('   Use this for training: node scripts/train-and-save-model.js');
