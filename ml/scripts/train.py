#!/usr/bin/env python3
"""
ML Model Training Script

Trains Isolation Forest model on labeled hydropower readings.
Publicly reproducible with same training data.
"""

import sys
import json
import pickle
import argparse
from datetime import datetime
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def load_training_data(filepath):
    """Load and parse training data"""
    with open(filepath, 'r') as f:
        dataset = json.load(f)
    
    data = dataset['data']
    metadata = dataset['metadata']
    
    print(f"\n📊 Dataset: {metadata['version']}")
    print(f"Total samples: {metadata['total_samples']}")
    print(f"Fraud rate: {metadata['fraud_rate']}")
    print(f"SHA256: {metadata['sha256']}\n")
    
    return data, metadata

def prepare_features(data):
    """Extract features and labels"""
    X = []
    y = []
    
    for reading in data:
        features = [
            reading['flowRate'],
            reading['head'],
            reading['generatedKwh'],
            reading['pH'],
            reading['turbidity'],
            reading['temperature']
        ]
        X.append(features)
        y.append(1 if reading['isFraud'] else 0)  # 1 = fraud, 0 = normal
    
    return np.array(X), np.array(y)

def train_model(X_train, y_train, contamination=0.2):
    """Train Isolation Forest"""
    print("🔧 Training Isolation Forest...")
    print(f"Contamination rate: {contamination}")
    
    model = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100,
        max_samples='auto',
        n_jobs=-1
    )
    
    model.fit(X_train)
    
    print("✅ Training complete")
    return model

def evaluate_model(model, X_test, y_test):
    """Evaluate model performance"""
    predictions = model.predict(X_test)
    
    # Convert: -1 (anomaly) = 1 (fraud), 1 (normal) = 0 (not fraud)
    predictions = np.where(predictions == -1, 1, 0)
    
    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions, zero_division=0)
    recall = recall_score(y_test, predictions, zero_division=0)
    f1 = f1_score(y_test, predictions, zero_division=0)
    
    # False positive rate
    fp = np.sum((predictions == 1) & (y_test == 0))
    tn = np.sum((predictions == 0) & (y_test == 0))
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
    
    metrics = {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'false_positive_rate': float(fpr)
    }
    
    print("\n📈 Model Performance:")
    print(f"Accuracy:  {accuracy*100:.1f}%")
    print(f"Precision: {precision*100:.1f}%")
    print(f"Recall:    {recall*100:.1f}%")
    print(f"F1-Score:  {f1*100:.1f}%")
    print(f"FPR:       {fpr*100:.1f}%\n")
    
    return metrics

def save_model(model, output_path):
    """Save trained model"""
    with open(output_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"💾 Model saved to: {output_path}")

def save_metrics(metrics, metadata, output_path):
    """Save training metrics"""
    metrics_data = {
        'model_version': '0.1.0',
        'model_type': 'IsolationForest',
        'training_date': datetime.now().isoformat(),
        'dataset_version': metadata['version'],
        'dataset_sha256': metadata['sha256'],
        'training_samples': metadata['total_samples'],
        'metrics': metrics,
        'reproducible': True,
        'random_seed': 42
    }
    
    with open(output_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)
    
    print(f"📊 Metrics saved to: {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Train ML fraud detection model')
    parser.add_argument('--data', default='ml/data/training_v0.1.0.json', help='Training data path')
    parser.add_argument('--output', default='ml/models/isolation_forest_v0.1.pkl', help='Model output path')
    parser.add_argument('--metrics', default='ml/models/model_metrics.json', help='Metrics output path')
    parser.add_argument('--contamination', type=float, default=0.2, help='Expected fraud rate')
    
    args = parser.parse_args()
    
    # Load data
    data, metadata = load_training_data(args.data)
    
    # Prepare features
    X, y = prepare_features(data)
    
    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples\n")
    
    # Train
    model = train_model(X_train, y_train, contamination=args.contamination)
    
    # Evaluate
    metrics = evaluate_model(model, X_test, y_test)
    
    # Save
    save_model(model, args.output)
    save_metrics(metrics, metadata, args.metrics)
    
    print("\n✅ Training pipeline complete!")
    print("\nTo verify reproducibility:")
    print(f"  sha256sum {args.output}")

if __name__ == '__main__':
    main()
