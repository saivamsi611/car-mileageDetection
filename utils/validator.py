from config import ALLOWED_EXTENSIONS

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_columns(df):
    required_cols = ['cylinders', 'displacement', 'horsepower', 'weight', 'acceleration']

    for col in required_cols:
        if col not in df.columns:
            return False, col

    return True, None