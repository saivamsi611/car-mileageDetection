from flask import Blueprint, request, jsonify
from services.prediction_service import predict_single

predict_bp = Blueprint("predict", __name__)

@predict_bp.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        print("Incoming Data:", data)   # 👈 DEBUG

        result = predict_single(data)

        return jsonify({
            "prediction": result
        })

    except Exception as e:
        print("API Error:", e)   # 👈 DEBUG
        return jsonify({"error": str(e)}), 500