# 🚗 Car Mileage Prediction System

A Machine Learning powered web application that predicts a vehicle's fuel efficiency (**Miles Per Gallon - MPG**) using automobile specifications such as cylinders, horsepower, weight, displacement, and acceleration.

**Model Accuracy:** ✅ **91.69%**

---

# 📌 Problem Statement

Fuel efficiency is one of the most important factors when evaluating a vehicle. Estimating mileage manually can be difficult because multiple vehicle parameters influence fuel consumption.

This project uses Machine Learning to analyze vehicle characteristics and predict fuel efficiency accurately.

---

# 🎯 Objectives

* Predict vehicle mileage (MPG) using machine learning.
* Provide real-time predictions through REST APIs.
* Support bulk prediction using CSV files.
* Display feature importance for model explainability.
* Provide a simple and user-friendly frontend interface.

---

# 🏗 System Architecture

```text
User
 │
 ▼
Frontend (HTML/CSS/JS)
 │
 ▼
Flask REST API
 │
 ▼
Prediction Service
 │
 ▼
Trained Machine Learning Model
 │
 ▼
Predicted MPG
```

---

# 🛠 Technology Stack

## Backend

* Python
* Flask
* Pandas
* NumPy
* Scikit-Learn
* Joblib

## Frontend

* HTML5
* CSS3
* JavaScript

## Machine Learning

* Regression Algorithms
* Feature Engineering
* Model Serialization (Joblib/Pickle)

---

# 📊 Dataset Features

The model expects the following vehicle attributes:

| Feature      | Description         |
| ------------ | ------------------- |
| cylinders    | Number of cylinders |
| displacement | Engine displacement |
| horsepower   | Engine horsepower   |
| weight       | Vehicle weight      |
| acceleration | Acceleration rate   |
| model_year   | Manufacturing year  |
| origin       | Country/region code |

---

# 🤖 Machine Learning Workflow

1. Data Collection
2. Data Cleaning
3. Missing Value Handling
4. Feature Selection
5. Model Training
6. Model Evaluation
7. Model Serialization
8. API Integration
9. Frontend Deployment

---

# 📈 Model Performance

| Metric          | Value      |
| --------------- | ---------- |
| Accuracy        | 91.69%     |
| Prediction Type | Regression |
| Output          | MPG Value  |

The trained model achieves a prediction accuracy of approximately **91.69%**, making it suitable for educational, research, and demonstration purposes.

---

# 🔍 Feature Importance

The API provides feature importance scores to explain which vehicle characteristics influence mileage most.

Example:

```json
{
  "weight": 0.34,
  "horsepower": 0.22,
  "displacement": 0.18,
  "cylinders": 0.12,
  "acceleration": 0.07,
  "model_year": 0.05,
  "origin": 0.02
}
```

---

# 📡 API Documentation

## Health Check

### Request

```http
GET /
```

### Response

```json
{
  "status": "running",
  "accuracy": "91.69%"
}
```

---

## Single Prediction

### Endpoint

```http
POST /predict
```

### Request Body

```json
{
  "cylinders": 4,
  "displacement": 140,
  "horsepower": 90,
  "weight": 2264,
  "acceleration": 15.5,
  "model_year": 82,
  "origin": 1
}
```

### Success Response

```json
{
  "prediction": 25.34
}
```

---

## CSV Batch Prediction

### Endpoint

```http
POST /predict_csv
```

### Form Data

| Parameter     | Type    |
| ------------- | ------- |
| file          | CSV     |
| allow_missing | Boolean |

### Response

```json
{
  "message": "Predictions completed successfully",
  "rows_processed": 100
}
```

---

## Feature Importance

### Endpoint

```http
GET /api/insights/importance
```

### Response

```json
{
  "horsepower": 0.23,
  "weight": 0.34,
  "displacement": 0.17
}
```

---

# 📁 Directory Structure

```text
Car-Mileage-Prediction/
│
├── app.py
├── requirements.txt
│
├── model/
│   ├── model.pkl
│   ├── accuracy.txt
│
├── routes/
│   ├── predict.py
│   ├── predict_csv.py
│   └── insights.py
│
├── services/
│   ├── prediction_service.py
│   └── csv_service.py
│
├── uploads/
├── utils/
├── data/
│
└── car-mileage-frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

---

# 🚀 Deployment

## Local Deployment

```bash
git clone <repository-url>

cd Car-Mileage-Prediction

python -m venv venv

source venv/bin/activate
# Windows:
venv\Scripts\activate

pip install -r requirements.txt

python app.py
```

Server starts at:

```text
http://127.0.0.1:5000
```

---

# 🐳 Docker Deployment (Optional)

```dockerfile
FROM python:3.11

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

CMD ["python","app.py"]
```

Build:

```bash
docker build -t car-mileage-app .
```

Run:

```bash
docker run -p 5000:5000 car-mileage-app
```

---

# ⚠ Error Handling

The API validates:

* Missing fields
* Invalid numeric values
* Empty CSV uploads
* Unsupported file types
* Model loading failures

Example:

```json
{
  "error": "horsepower must be numeric"
}
```

---

# 🔮 Future Enhancements

* User Authentication
* Interactive Dashboard
* Data Visualization Charts
* Multiple ML Models Comparison
* Cloud Deployment (AWS/Azure/GCP)
* Model Retraining Pipeline
* Historical Prediction Tracking
* Explainable AI (SHAP/LIME)

---

