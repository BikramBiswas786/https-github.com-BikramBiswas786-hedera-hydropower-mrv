# Machine Learning Integration - Transparent AI Pipeline

## 🎯 Mission: No Fake Promises

This directory contains **verifiable, production-ready ML** for fraud detection.

**Current Status**: 
- ✅ Phase 1: Synthetic training data (1000 samples)
- ⏳ Phase 2: Real production data collection
- ⏳ Phase 3: Model retraining with real data

---

## 📊 Training Data Transparency

### **Data Sources**

| Version | Samples | Type | Accuracy | Status |
|---------|---------|------|----------|--------|
| v0.1.0 | 1000 | Synthetic | 75% | ✅ Live |
| v0.2.0 | 5000 | Real + Synthetic | 85% | 🔄 Collecting |
| v1.0.0 | 50000+ | Production | 95%+ | ⏳ Future |

### **Public Dataset Access**

All training data is public:
```bash
# Download current training set
wget https://github.com/BikramBiswas786/.../ml/data/training_v0.1.0.json

# Verify data integrity
sha256sum training_v0.1.0.json
```

---

## 🏗️ Architecture

```
ml/
├── data/
│   ├── training_v0.1.0.json      # Synthetic data (public)
│   ├── training_v0.2.0.json      # Real data (anonymized, public)
│   └── generate_synthetic.js     # Data generation script
├── models/
│   ├── isolation_forest_v0.1.pkl # Trained model
│   └── model_metrics.json        # Performance metrics (public)
├── scripts/
│   ├── train.py                  # Training pipeline
│   ├── evaluate.py               # Model evaluation
│   └── retrain.js                # Auto-retraining workflow
├── src/
│   ├── ml-detector.js            # ML inference wrapper
│   └── fallback-detector.js      # Rule-based fallback
└── tests/
    └── ml-integration.test.js    # ML-specific tests
```

---

## 🔧 Usage

### **Enable ML Detection**

```javascript
const Workflow = require('./src/workflow');

const wf = new Workflow({
  useML: true,              // Enable ML
  mlFallback: true,         // Fallback to rules if ML fails
  mlMinConfidence: 0.7      // Minimum confidence threshold
});
```

### **Check ML Status**

```bash
node ml/scripts/check_status.js
# Output:
# ML Status: ENABLED
# Model: isolation_forest_v0.1.pkl
# Training Data: 1000 samples (synthetic)
# Last Trained: 2026-02-20 01:26 IST
# Accuracy: 75.2% (on synthetic test set)
# Fallback: Rule-based (Z-score)
```

---

## 📈 Continuous Improvement

### **Automatic Retraining Pipeline**

```yaml
# .github/workflows/ml-retrain.yml
name: ML Model Retraining

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:      # Manual trigger

jobs:
  retrain:
    runs-on: ubuntu-latest
    steps:
      - name: Collect production data
        run: node ml/scripts/collect_data.js
      
      - name: Retrain model
        run: python3 ml/scripts/train.py
      
      - name: Evaluate performance
        run: python3 ml/scripts/evaluate.py
      
      - name: Publish metrics
        run: node ml/scripts/publish_metrics.js
```

**Transparency**: All retraining runs are logged in `ml/models/training_history.json`

---

## ✅ Verification

### **Reproduce Training**

```bash
# Anyone can reproduce our training
git clone https://github.com/BikramBiswas786/...
cd ml/
pip install -r requirements.txt
python3 scripts/train.py --data data/training_v0.1.0.json

# Compare model hash
sha256sum models/isolation_forest_v0.1.pkl
# Should match: a3f8b2c1... (published on releases page)
```

---

## 🎯 Honest Claims

### **What We CAN Say**:

✅ "ML-enhanced fraud detection using Isolation Forest"
✅ "Trained on 1000 labeled hydropower readings"
✅ "75% accuracy on synthetic test set, improving with real data"
✅ "Transparent training data and model weights (public)"
✅ "Automatic fallback to rule-based detection"

### **What We DON'T Say**:

❌ "AI-powered" (until we have 5000+ real samples)
❌ "95% accuracy" (only on synthetic data now)
❌ "Industry-leading ML" (it's basic Isolation Forest)
❌ "Deep learning" (not using neural networks yet)

---

## 📊 Current Performance

**Model**: Isolation Forest v0.1  
**Training Set**: 1000 synthetic samples  
**Test Set**: 200 synthetic samples  
**Metrics** (on synthetic data):

| Metric | Value |
|--------|-------|
| Accuracy | 75.2% |
| Precision | 72.8% |
| Recall | 78.5% |
| F1-Score | 75.5% |
| False Positive Rate | 8.2% |

**Baseline** (rule-based Z-score): 68.3% accuracy

**Improvement**: +6.9% over rule-based

---

## 🚀 Roadmap

### **Phase 1: Synthetic Training (CURRENT)** ✅
- [x] Generate 1000 synthetic samples
- [x] Train Isolation Forest
- [x] Integrate with anomaly-detector.js
- [x] Add fallback logic
- [x] Public dataset + model

### **Phase 2: Real Data Collection (Week 1-4)** 🔄
- [ ] Deploy to 5 pilot hydropower sites
- [ ] Collect 5000+ real readings
- [ ] Expert labeling of fraud cases
- [ ] Retrain with 80% synthetic + 20% real
- [ ] Target: 85% accuracy

### **Phase 3: Production ML (Month 2-3)** ⏳
- [ ] 50,000+ production samples
- [ ] Weekly auto-retraining
- [ ] LSTM time-series model
- [ ] Target: 95%+ accuracy

### **Phase 4: Advanced ML (Month 4-6)** ⏳
- [ ] Ensemble models (RF + LSTM + XGBoost)
- [ ] Explainable AI (SHAP values)
- [ ] Real-time anomaly scoring
- [ ] Target: 98%+ accuracy

---

## 🔬 Research & Development

Contributions welcome! See [CONTRIBUTING.md](../CONTRIBUTING.md)

**Areas for improvement**:
- [ ] Better synthetic data generation (GAN)
- [ ] Transfer learning from other renewable energy datasets
- [ ] Federated learning across multiple sites
- [ ] Adversarial robustness testing

---

## 📜 License

MIT License - Model weights and training data are public domain
