import joblib
import numpy as np


_raw_model = joblib.load("model/fraud_model.pkl")

# Some training scripts save a dict like {"model": estimator} instead of the
# bare estimator. Unwrap that here so we always have an object with
# predict_proba / predict methods.
if isinstance(_raw_model, dict):
    model = (
        _raw_model.get("model")
        or _raw_model.get("estimator")
        or _raw_model.get("clf")
        or _raw_model
    )
else:
    model = _raw_model


def predict(tx: dict):
    # The XGBoost model was trained on 7 numeric features derived from the
    # original transaction schema (excluding label columns):
    #   1. step
    #   2. type_code (ordinal encoding of transaction type)
    #   3. amount
    #   4. oldbalanceOrg
    #   5. newbalanceOrig
    #   6. oldbalanceDest
    #   7. newbalanceDest

    type_mapping = {
        "PAYMENT": 0,
        "TRANSFER": 1,
        "CASH_OUT": 2,
        "CASH_IN": 3,
        "DEBIT": 4,
    }

    type_code = type_mapping.get(str(tx["type"]).upper(), -1)

    features = [
        float(tx["step"]),
        float(type_code),
        float(tx["amount"]),
        float(tx["oldbalanceOrg"]),
        float(tx["newbalanceOrig"]),
        float(tx["oldbalanceDest"]),
        float(tx["newbalanceDest"]),
    ]

    X = np.array([features], dtype=float)

    if hasattr(model, "predict_proba"):
        prob = float(model.predict_proba(X)[0][1])
    else:
        # Fallback: use predict() that returns probabilities directly
        prob = float(model.predict(X)[0])

    is_fraud = bool(prob > 0.5)

    return is_fraud, prob
