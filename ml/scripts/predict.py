#!/usr/bin/env python3
import sys
import json
import pickle
import numpy as np
from pathlib import Path
def load_model(model_path):
    with open(model_path, 'rb') as f:
        return pickle.load(f)
def predict(model, reading):
    features = np.array([[
        reading.get('waterFlow', 125.0),
        reading.get('powerOutput', 95.0),
        reading.get('efficiency', 0.88),
        reading.get('temperature', 22.0),
        reading.get('pressure', 1.2),
        reading.get('vibration', 0.5)
    ]])
    prediction = model.predict(features)[0]
    score = model.score_samples(features)[0]
    fraud_score = 1.0 / (1.0 + np.exp(score))
    return {
        'fraud_score': float(fraud_score),
        'is_fraud': bool(prediction == -1),  # Convert to Python bool
        'confidence': 0.85,
        'raw_score': float(score)
    }
def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input provided'}))
        sys.exit(1)
    try:
        reading = json.loads(sys.argv[1])
        model_path = Path(__file__).parent.parent / 'models' / 'isolation_forest_v0.1.pkl'
        if not model_path.exists():
            print(json.dumps({'error': 'Model not found'}))
            sys.exit(1)
        model = load_model(model_path)
        result = predict(model, reading)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)
if __name__ == '__main__':
    main()
