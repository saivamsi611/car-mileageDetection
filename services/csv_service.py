import pandas as pd
from model.preprocess import clean_data, get_features
from services.prediction_service import model

def predict_csv(df, allow_missing=False):

    df = clean_data(df, allow_missing)

    X = get_features(df)

    predictions = model.predict(X.values)

    df['predicted_mileage'] = predictions.round(2)

    return df.to_dict(orient="records")