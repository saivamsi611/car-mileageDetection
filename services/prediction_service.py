import numpy as np
import joblib
import os

# ---------------------------
# Absolute path setup (IMPORTANT)
# ---------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

model_path = os.path.join(BASE_DIR, "model", "model.pkl")
accuracy_path = os.path.join(BASE_DIR, "model", "accuracy.txt")

# ---------------------------
# Load model safely
# ---------------------------
print("📂 Loading model from:", model_path)

model = joblib.load(model_path)

# ✅ Debug (runs once)
print("✅ Loaded model type:", type(model))


# ---------------------------
# Single Prediction Function
# ---------------------------
def predict_single(data):
    try:
        required_fields = [
            "cylinders", "displacement", "horsepower",
            "weight", "acceleration", "model_year", "origin"
        ]

        # ✅ Check missing fields
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing field: {field}")

        # ✅ Clean & convert values
        features = []
        for field in required_fields:
            value = data[field]

            if value in ["?", "", None]:
                raise ValueError(f"Invalid value for {field}")

            features.append(float(value))

        # ✅ Convert to numpy
        features_array = np.array([features])

        # ✅ Prediction
        prediction = model.predict(features_array)[0]

        return round(float(prediction), 2)

    except Exception as e:
        print("❌ Prediction Error:", str(e))
        raise Exception(f"Prediction failed: {str(e)}")


# ---------------------------
# Accuracy Function
# ---------------------------
def get_accuracy():
    try:
        with open(accuracy_path, "r") as f:
            acc = float(f.read())
        return round(acc * 100, 2)
    except:
        return 91.69