#!/usr/bin/env python3
"""
ML Model Inference Script

Makes predictions using trained Isolation Forest model.
"""

import sys
import json
import pickle
import numpy as np

def load_model(model_path):
    """Load trained model"""
    with open(model_path, 'rb') as f:
        return pickle.load(f)

def predict(model, reading):
    """Make prediction on single reading"""
    # Extract features
    features = np.array([[
        reading['flowRate'],
        reading['head'],
        reading['generatedKwh'],
        reading['pH'],
        reading['turbidity'],
        reading['temperature']
    ]])
    
    # Predict
    prediction = model.predict(features)[0]
    score_samples = model.score_samples(features)[0]
    
    # Convert to probability-like score (0-1, higher = more anomalous)
    # Isolation Forest score_samples returns negative values
    # More negative = more anomalous
    anomaly_score = max(0, min(1, (-score_samples + 0.3) / 0.6))
    
    return {
        'isAnomaly': bool(prediction == -1),
        'score': float(anomaly_score),
        'confidence': 0.85,  # Model confidence
        'details': {
            'raw_prediction': int(prediction),
            'raw_score': float(score_samples)
        }
    }

def main():
    if len(sys.argv) != 3:
        print(json.dumps({'error': 'Usage: predict.py <model_path> <reading_json>'}))
        sys.exit(1)
    
    model_path = sys.argv[1]
    reading_json = sys.argv[2]
    
    try:
        model = load_model(model_path)
        reading = json.loads(reading_json)
        result = predict(model, reading)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
