import numpy as np
import pandas as pd
from sales.lstm_simple_preprocessing import MultiZipPreprocessor
from keras.models import load_model
from scipy.interpolate import interp1d
import matplotlib.pyplot as plt
from delta import get_delta
from scipy.interpolate import make_interp_spline
from scipy.signal import savgol_filter
import matplotlib.pyplot as plt
# 在插值前对prices做平滑
# Shared preprocessing once — this works because the CSV is the same
CSV_PATH = "sales/Datasets_HOME_VALUE/condo.csv"
LOOKBACK = 24


def get_forecast_by_uid(uid: int, path: str = "forecast_results.csv") -> dict[int, float]:
    """
    Retrieve the full horizon-price mapping for a given UID
    as saved by `save_forecast_to_csv`.

    Parameters
    ----------
    uid  : int
        Unique identifier used when saving forecasts.
    path : str
        CSV file containing the forecasts (default: "forecast_results.csv").

    Returns
    -------
    dict[int, float]
        Keys are horizons (time offsets: −12 … 65, 0 for current FV),
        values are the corresponding predicted prices.

    Raises
    ------
    FileNotFoundError
        If `path` does not exist.
    ValueError
        If no rows match the supplied UID.
    """
    df = pd.read_csv(path)
    df_uid = df[df["uid"] == uid]

    if df_uid.empty:
        raise ValueError(f"No forecasts found for uid={uid} in {path}")

    # Ensure horizons are sorted chronologically
    df_uid = df_uid.sort_values("horizon")
    return dict(zip(df_uid["horizon"], df_uid["predicted_price"]))




def cache_intaker(zip_code:int, score=5, error=0):
    df=pd.read_csv("forecast_results.csv")
    df_zip = df[df['zip_code'] == zip_code]
    # 假设 horizon 列就是时间（如月份），predicted_price 是价格
    return dict(zip(df_zip['horizon'], df_zip['predicted_price']))


def forecast_single(zip_code: int,
                    prep: MultiZipPreprocessor,
                    out: dict,
                    model) -> float:
    """
    Returns a single point forecast HORIZON months ahead for `zip_code`.
    """
    lookback = out["lookback"]
    num_cols = [
        "lag_1", "lag_2", "lag_3", "lag_12",
        "rolling_mean_6", "pct_change_1",
        "sin_month", "cos_month",
    ]

    # -------- fetch last window for this ZIP --------
    df_zip = prep.long[prep.long.RegionName == zip_code].copy().reset_index(drop=True)
    if len(df_zip) < lookback:
        raise ValueError(f"ZIP {zip_code} has only {len(df_zip)} rows (need ≥{lookback}).")

    window_df = df_zip.iloc[-lookback:].copy()

    # -------- create model input --------
    X_num  = out["scaler_X"].transform(window_df[num_cols].values.astype(float))
    zid    = out["zip_lookup"][zip_code]
    X_full = np.hstack([X_num, np.full((lookback, 1), zid)])
    X_full = X_full[np.newaxis, :, :]

    n_num = out["n_numeric"]
    X_in  = [X_full[:, :, :n_num],
             X_full[:, :, n_num:].astype("int32").squeeze(-1)]

    # -------- predict & inverse-scale --------
    y_scaled = model.predict(X_in, verbose=0).ravel()
    y_real   = out["scaler_y"].inverse_transform(y_scaled.reshape(-1, 1)).ravel()[0]
    return float(y_real)

def get_last_12_adjusted_prices(prep: MultiZipPreprocessor, zip_code: int) -> dict[int, float]:
    df_zip = (
        prep.long[prep.long.RegionName == zip_code]
        .sort_values("date")
        .tail(12)
    )
    # keys −12 … −1  (months ago), values = already-delta-adjusted prices
    return {-(12 - i): p for i, p in enumerate(df_zip["price"].values)}


def input_handler(uid:int,zip_code: int,listing_price:int, score=5):
    forecast = {
        10: "1-year.h5", 12: "1-year.h5", 14: "1-year.h5", 20: "1-year.h5", 24: "1-year.h5",
        30: "3-year.h5", 36: "3-year.h5", 42: "3-year.h5",
        45: "5-year.h5", 48: "5-year.h5", 55: "5-year.h5", 60: "5-year.h5", 65: "5-year.h5",
    }

    error=get_latest_fv_from_csv(zip_code)-listing_price
    print("error is:",error)
    print("last fv price:" , get_latest_fv_from_csv(zip_code))
    fv_latest = get_latest_fv_from_csv(zip_code)
    delta = get_delta(score, error)
    print("Delta value:", delta)

    raw_forecasts: dict[int, float] = {}
    forecast_results: dict[int, float] = {}
    history_added = False

    for horizon, model_file in forecast.items():
        print(f"⏳ Forecasting {horizon} months ahead…")

        prep = MultiZipPreprocessor(
            data_path=CSV_PATH,
            lookback=LOOKBACK,
            horizon=horizon,
            delta=delta,
        )
        out = prep.run()

        if not history_added:
            forecast_results.update(get_last_12_adjusted_prices(prep, zip_code))
            history_added = True

        model = load_model(model_file, compile=False)
        price = forecast_single(zip_code, prep, out, model)
        print("For horizon", horizon, "predicted price:", price)
        raw_forecasts[horizon] = price

    # Smooth forecasted prices only
    sorted_forecast_keys = sorted(raw_forecasts.keys())
    sorted_forecast_vals = [raw_forecasts[k] for k in sorted_forecast_keys]
    smoothed_vals = savgol_filter(sorted_forecast_vals, window_length=5, polyorder=2)

    # Insert smoothed forecast into final result
    for k, v in zip(sorted_forecast_keys, smoothed_vals):
        forecast_results[k] = v
    forecast_results[0] = fv_latest
    print(forecast_results)
    return forecast_results



def save_forecast_to_csv(uid: int, zip_code: int, results: dict[int, float], path="forecast_results.csv"):
    df_new = pd.DataFrame([
        {"uid": uid, "zip_code": zip_code, "horizon": h, "predicted_price": p}
        for h, p in results.items()
    ])

    try:
        df_existing = pd.read_csv(path)
    except FileNotFoundError:
        df_new.to_csv(path, index=False)
        return

    # Drop existing rows with same uid
    df_existing = df_existing[df_existing["uid"] != uid]

    # Append new data and save
    df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    df_combined.to_csv(path, index=False)

# ZIP: 08701
result = input_handler(144, 8701, 589000, 5)
save_forecast_to_csv(144, 8701, result)

result = input_handler(145, 8701, 215000, 7)
save_forecast_to_csv(145, 8701, result)

# ZIP: 11368
result = input_handler(146, 11368, 899000, 5)
save_forecast_to_csv(146, 11368, result)

result = input_handler(149, 60629, 399999, 5)
save_forecast_to_csv(149, 60629, result)

# ZIP: 90650
result = input_handler(150, 90650, 264900, 4)
save_forecast_to_csv(150, 90650, result)


result = input_handler(153, 91331, 325000, 6)
save_forecast_to_csv(153, 91331, result)

# ZIP: 94107
result = input_handler(154, 94107, 999000, 6)
save_forecast_to_csv(154, 94107, result)

result = input_handler(155, 94107, 795000, 6)
save_forecast_to_csv(155, 94107, result)
# Example usage
forecast_map = get_forecast_by_uid(144)
print(forecast_map)  # { -12: ..., -11: ..., 0: ..., 10: ..., 12: ..., … }
