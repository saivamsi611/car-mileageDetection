from flask import Flask, jsonify
from flask_cors import CORS   # 👈 ADD THIS
from routes.predict import predict_bp
from routes.predict_csv import csv_bp
from routes.insights import insights_bp
from services.prediction_service import get_accuracy

app = Flask(__name__)
CORS(app)   # 👈 ADD THIS (VERY IMPORTANT)

# Register routes
app.register_blueprint(predict_bp)
app.register_blueprint(csv_bp)
app.register_blueprint(insights_bp)

@app.route("/")
def home():
    return jsonify({
        "message": "Car Mileage Prediction Backend Running",
        "accuracy": get_accuracy()
    })

if __name__ == "__main__":
    app.run(debug=True)