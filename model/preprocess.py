import pandas as pd

def clean_data(df, allow_missing=False):
    required_cols = ["cylinders", "displacement", "horsepower",
                     "weight", "acceleration", "model_year", "origin"]
    
    defaults = {
        'cylinders': 4.0,
        'displacement': 193.0,
        'horsepower': 104.0,
        'weight': 2970.0,
        'acceleration': 15.5,
        'model_year': 76.0,
        'origin': 1.0
    }
    
    if allow_missing:
        for col in required_cols:
            if col not in df.columns:
                df[col] = defaults[col]
            else:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(defaults[col])
    else:
        for col in required_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        df = df.dropna(subset=[c for c in required_cols if c in df.columns])
        
    return df

def get_features(df):
    return df[['cylinders', 'displacement', 'horsepower', 'weight', 'acceleration', 'model_year', 'origin']]