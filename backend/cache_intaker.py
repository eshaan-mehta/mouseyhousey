import pandas as pd

def cache_intaker(uid: int, zip_code: int, listing_price: int, score=5) -> dict[int, float]:
    """
    Return the cached forecast results for a specific uid in the same format
    as `input_handler`, including both historical and forecasted prices.

    Parameters
    ----------
    uid           : int
        Unique identifier used when saving forecasts.
    zip_code      : int
        ZIP code of the property (for cross-validation if needed).
    listing_price : int
        Not used here but retained for signature compatibility.
    score         : int
        Not used here but retained for signature compatibility.

    Returns
    -------
    dict[int, float]
        Keys are month offsets (e.g., −12 to 65), values are prices, sorted by horizon.
    """
    df = pd.read_csv("forecast_results.csv")
    df_uid = df[df["uid"] == uid]

    if df_uid.empty:
        raise ValueError(f"No forecast results found for uid={uid}")

    df_uid = df_uid.sort_values(by="horizon")
    return dict(zip(df_uid["horizon"], df_uid["predicted_price"]))

# print(cache_intaker(144, 8701, 589000, 5))
