from flask import Blueprint, jsonify
from services.prediction_service import model

insights_bp = Blueprint("insights", __name__)

@insights_bp.route("/api/insights/importance", methods=["GET"])
def get_feature_importance():
    try:
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_.tolist()
            features = ["cylinders", "displacement", "horsepower", "weight", "acceleration", "model year", "origin"]
            
            data = [{"feature": f, "importance": i} for f, i in zip(features, importances)]
            return jsonify({"status": "success", "data": data})
        else:
            return jsonify({"status": "error", "message": "Loaded model does not support feature importance profiling."}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
