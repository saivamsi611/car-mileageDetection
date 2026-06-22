import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn import metrics
import joblib
import os

# Load dataset
df = pd.read_csv("../data/raw/auto-mpg.csv")

# Clean data
df.replace("?", pd.NA, inplace=True)
df['horsepower'] = pd.to_numeric(df['horsepower'], errors='coerce')
df['horsepower'] = df['horsepower'].fillna(df['horsepower'].mean())

# Features & target
X = df[['cylinders', 'displacement', 'horsepower',
        'weight', 'acceleration', 'model year', 'origin']]

y = df['mpg']

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Model tuning
param_grid = {
    'n_estimators': [100, 200],
    'max_depth': [8, 10, 15],
    'min_samples_split': [2, 5],
}

grid = GridSearchCV(
    RandomForestRegressor(random_state=42),
    param_grid,
    cv=3,
    n_jobs=-1
)

grid.fit(X_train, y_train)

# Best model
model = grid.best_estimator_

# Accuracy
y_pred = model.predict(X_test)
accuracy = metrics.r2_score(y_test, y_pred)

print("Best Parameters:", grid.best_params_)
print("Final Accuracy:", accuracy)

# ✅ SAVE FIXED
model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
joblib.dump(model, model_path)

accuracy_path = os.path.join(os.path.dirname(__file__), "accuracy.txt")
with open(accuracy_path, "w") as f:
    f.write(str(accuracy))

print("MAE:", metrics.mean_absolute_error(y_test, y_pred))
print("RMSE:", metrics.mean_squared_error(y_test, y_pred) ** 0.5)