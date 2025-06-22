import numpy as np
import pandas as pd
from sales.lstm_simple_preprocessing import MultiZipPreprocessor
from keras.models import load_model
from scipy.interpolate import interp1d
import matplotlib.pyplot as plt
# Shared preprocessing once — this works because the CSV is the same
CSV_PATH = "sales/Datasets_HOME_VALUE/condo.csv"
LOOKBACK = 24



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


def input_handler(zip_code:int,housing_type="Condo"):
    forecast = {
        10: "1-year.h5", 12: "1-year.h5", 14: "1-year.h5", 20: "1-year.h5", 24: "1-year.h5",
        30: "3-year.h5", 36: "3-year.h5", 42: "3-year.h5",45:"5-year.h5", 48: "5-year.h5",
        55: "5-year.h5", 60: "5-year.h5", 65: "5-year.h5"
    }
    global CSV_PATH
    forecast_results = {}
    if housing_type == "Condo":
        CSV_PATH="sales/Datasets_HOME_VALUE/condo.csv"
    elif housing_type == "House 2Bed":
        CSV_PATH = "sales/Datasets_HOME_VALUE/2-bed-house.csv"

    for horizon, model_file in forecast.items():
        print(f"⏳ Forecasting {horizon} months ahead...")
        prep = MultiZipPreprocessor(data_path=CSV_PATH, lookback=LOOKBACK, horizon=horizon)
        out = prep.run()
        model = load_model(f"{model_file}",compile=False)
        price = forecast_single(zip_code, prep, out, model)
        forecast_results[horizon] = price
        print("Forecast for ZIP", zip_code, "in", horizon, "months:", price)
    return forecast_results

def plot_forecast_curve(forecast_results: dict, zip_code: int):
    # Sort forecast horizons
    horizons = sorted(forecast_results.keys())
    prices = [forecast_results[h] for h in horizons]

    # Interpolation
    interp_fn = interp1d(horizons, prices, kind='quadratic')
    x_new = np.linspace(min(horizons), max(horizons), 300)
    y_new = interp_fn(x_new)

    # Plot
    plt.figure(figsize=(8, 5))
    plt.plot(x_new, y_new, label='Interpolated Forecast', linewidth=2)
    plt.scatter(horizons, prices, color='red', zorder=5, label='Forecast Points')
    plt.title(f'Forecasted Prices for ZIP {zip_code}')
    plt.xlabel('Months Ahead')
    plt.ylabel('Predicted Price ($)')
    plt.grid(True)
    plt.legend()
    plt.tight_layout()
    plt.show()

import pandas as pd

zip_codes = [8701, 11368, 60629, 90650, 91331]
all_results = []

for zip_code in zip_codes:
    results = input_handler(zip_code, housing_type='Condo')
    # 保存曲线图
    plot_forecast_curve(results, zip_code)
    plt.savefig(f'forecast_{zip_code}.png')
    plt.close()
    # 汇总结果
    for horizon, price in results.items():
        all_results.append({
            "zip_code": zip_code,
            "horizon": horizon,
            "predicted_price": price
        })

df = pd.DataFrame(all_results)
df.to_csv('forecast_results.csv', index=False)
print("所有结果和图片已保存。")
