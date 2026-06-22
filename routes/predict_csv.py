from flask import Blueprint, request, jsonify
from utils.file_handler import save_file
from utils.validator import allowed_file
from services.csv_service import predict_csv
import pandas as pd

csv_bp = Blueprint("csv", __name__)

@csv_bp.route("/predict_csv", methods=["POST"])
def predict_csv_route():
    try:
        # -------------------------------
        # 1. Check file existence
        # -------------------------------
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400
        if not allowed_file(file.filename):
            return jsonify({"error": "Only CSV files allowed"}), 400

        # -------------------------------
        # 2. Save file
        # -------------------------------
        filepath = save_file(file)

        # -------------------------------
        # 3. Read CSV
        # -------------------------------
        df = pd.read_csv(filepath)
        allow_missing = request.form.get("allow_missing") == "true"

        # -------------------------------
        # 4. Validate required columns
        # -------------------------------
        required_cols = ["cylinders","displacement","horsepower",
                         "weight","acceleration","model_year","origin"]
        missing = [col for col in required_cols if col not in df.columns]
        
        if missing and not allow_missing:
            return jsonify({"error": f"Missing column(s): {', '.join(missing)}\nEnable 'Auto-fill' to impute these."}), 400

        # -------------------------------
        # 5. Clean and convert data
        # -------------------------------
        df.replace("?", pd.NA, inplace=True)
        # Type coercion and imputation defered to clean_data in preprocess.py

        # -------------------------------
        # 6. Predict
        # -------------------------------
        # Pass DataFrame directly instead of filepath
        result = predict_csv(df, allow_missing=allow_missing)

        return jsonify({
            "rows": len(result),
            "data": result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500