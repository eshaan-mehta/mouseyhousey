
"""Global panel‑style pre‑processor for *one* housing‑type file.

Every fully complete ZIP is kept; the script:
1. Converts the wide Zillow CSV into a long tidy panel.
2. Adds per‑ZIP lag/rolling features that are strictly causal.
3. Integer‑encodes the ZIP as `zip_id` (to be fed through an
   Embedding layer later).
4. Builds `[samples, lookback, n_features]` sequences across *all* ZIPs.
5. Fits MinMax scalers **on the training fold only**.
6. Returns train / val / test splits ready for an LSTM, plus helpers
   for inverse‑transforming predictions.
"""
from __future__ import annotations
import tensorflow as tf

from tensorflow.keras.layers import Input, Embedding, Concatenate, LSTM, Dropout, Dense
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam

import logging
from pathlib import Path
from typing import Dict, Tuple

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

logging.basicConfig(level=logging.INFO, format="%(asctime)s ▶ %(message)s")


class MultiZipPreprocessor:
    """Panel pre‑processor for a single housing‑type ZHVI file."""

    def __init__(self, data_path: str | Path, lookback: int = 24,horizon=12,delta=0):
        self.data_path = Path(data_path)
        self.lookback = lookback
        self.horizon = horizon
        self.delta=delta
        # artefacts filled during run()
        self.long: pd.DataFrame | None = None
        self.seq_X: np.ndarray | None = None
        self.seq_y: np.ndarray | None = None
        self.splits: Dict[str, Tuple[np.ndarray, np.ndarray]] | None = None
        self.scaler_X: MinMaxScaler | None = None
        self.scaler_y: MinMaxScaler | None = None
        self.zip_lookup: Dict[str, int] | None = None


    # ------------------------------------------------------------------
    # 1. Load & filter
    # ------------------------------------------------------------------
    def _load_and_melt(self):
        df = pd.read_csv(self.data_path)
        date_cols = [c for c in df.columns if c.count("-") == 2]
        # keep only ZIPs with *all* months present
        df = df[df[date_cols].notna().all(axis=1)].reset_index(drop=True)
        if df.empty:
            raise ValueError("No ZIP is fully complete – relax filter or fill gaps.")

        logging.info("Complete ZIPs retained: %d", len(df))

        long = df.melt(id_vars=["RegionName", "City", "State"],
                        value_vars=date_cols,
                        var_name="date", value_name="price")
        long["date"] = pd.to_datetime(long["date"])
        long = long.sort_values(["RegionName", "date"])

        # integer‑encode ZIP
        self.zip_lookup = {z: i for i, z in enumerate(long["RegionName"].unique())}
        long["zip_id"] = long["RegionName"].map(self.zip_lookup)
        self.long = long

    # ------------------------------------------------------------------
    # 2. Feature engineering (per ZIP, causal)
    # ------------------------------------------------------------------
    def _add_lags(self):
        g = self.long.groupby("RegionName")
        self.long["price"]=self.long.apply(lambda row:row["price"]+self.delta,axis=1)
        self.long["lag_1"] = g["price"].shift(1)
        self.long["lag_2"] = g["price"].shift(2)
        self.long["lag_3"] = g["price"].shift(3)
        self.long["lag_12"] = g["price"].shift(12)
        self.long["rolling_mean_6"] = (
            g["price"].shift(1).rolling(6).mean().reset_index(level=0, drop=True)
        )
        self.long["pct_change_1"] = g["price"].pct_change().shift(1)

        # month seasonality (same for all ZIPs)
        m = self.long["date"].dt.month
        self.long["sin_month"] = np.sin(2 * np.pi * m / 12)
        self.long["cos_month"] = np.cos(2 * np.pi * m / 12)

        self.long = self.long.dropna().reset_index(drop=True)
        logging.info("After lag engineering: %d rows", len(self.long))

    # ------------------------------------------------------------------
    # 3. Build sequences across all ZIPs
    # ------------------------------------------------------------------
    # ------------------------------------------------------------------
# 3. Build sequences across all ZIPs  (with zip-id tracking)
# ------------------------------------------------------------------
    def _make_sequences(self):
        """
        After feature engineering, turn the long dataframe into
          X : [samples, lookback, n_features]
          y : [samples]          (price at time t)
        plus
          seq_zip : [samples]    (integer ZIP id for each window)
        """
        feat_cols = [
            "lag_1", "lag_2", "lag_3", "lag_12",
            "rolling_mean_6", "pct_change_1",
            "sin_month", "cos_month",
        ]                              # -- 8 numeric features
        # numeric features first … zip_id last (will NOT be scaled)
        num_feat = self.long[feat_cols].values.astype(float)
        zip_feat = self.long["zip_id"].values.reshape(-1, 1)
        full_feat = np.hstack([num_feat, zip_feat])

        X, y, z_ids = [], [], []                     #  ← keep ZIP id per window
        start_idx = 0
        for z, grp in self.long.groupby("RegionName"):
            zid = self.zip_lookup[z]                 # integer id for this ZIP
            gvals  = full_feat[start_idx : start_idx + len(grp)]
            prices = grp["price"].values

            # rolling windows inside this ZIP (strictly causal)
            for i in range(self.lookback, len(grp)-self.horizon):
                X.append(gvals[i - self.lookback : i])
                y.append(prices[i+self.horizon])
                z_ids.append(zid)                    #  ← remember ZIP of window

            start_idx += len(grp)                    # jump to next ZIP slice

        # save as numpy arrays
        self.seq_X   = np.asarray(X)                 # shape (N, L, F+1)
        self.seq_y   = np.asarray(y)                 # shape (N,)
        self.seq_zip = np.asarray(z_ids)             # shape (N,)
        logging.info("Built sequences: X %s  y %s", self.seq_X.shape, self.seq_y.shape)

    # ------------------------------------------------------------------
    # 4. Split + scale (train only)
    # ------------------------------------------------------------------
    def _split_and_scale(self, train=0.7, val=0.15):
      X_tr, y_tr, X_va, y_va, X_te, y_te = [], [], [], [], [], []

      for zid in np.unique(self.seq_zip):
          idx = np.where(self.seq_zip == zid)[0]          # already chrono-ordered
          n   = len(idx)
          n_tr = int(n * train)
          n_va = int(n * val)

          X_tr.append(self.seq_X[idx[:n_tr]])
          y_tr.append(self.seq_y[idx[:n_tr]])

          X_va.append(self.seq_X[idx[n_tr:n_tr+n_va]])
          y_va.append(self.seq_y[idx[n_tr:n_tr+n_va]])

          X_te.append(self.seq_X[idx[n_tr+n_va:]])
          y_te.append(self.seq_y[idx[n_tr+n_va:]])

      splits = {
          "train": (np.concatenate(X_tr), np.concatenate(y_tr)),
          "val":   (np.concatenate(X_va), np.concatenate(y_va)),
          "test":  (np.concatenate(X_te), np.concatenate(y_te)),
      }

      # ---------- scaling (unchanged) ----------
      n_feat  = self.seq_X.shape[2]
      num_idx = n_feat - 1                      # last col = zip_id (no scale)

      self.scaler_X = MinMaxScaler()
      self.scaler_y = MinMaxScaler()

      X_train_flat = splits["train"][0][:, :, :num_idx].reshape(-1, num_idx)
      self.scaler_X.fit(X_train_flat)
      self.scaler_y.fit(splits["train"][1].reshape(-1, 1))

      for key, (X_raw, y_raw) in splits.items():
          X_num = X_raw[:, :, :num_idx].reshape(-1, num_idx)
          X_num = self.scaler_X.transform(X_num).reshape(
                      X_raw.shape[0], self.lookback, num_idx)
          X_scaled = np.concatenate([X_num, X_raw[:, :, num_idx:]], axis=-1)
          y_scaled = self.scaler_y.transform(y_raw.reshape(-1, 1)).ravel()
          splits[key] = (X_scaled, y_scaled)
          logging.info("%s split → %d sequences", key.capitalize(), len(X_scaled))

      self.splits = splits

    # ------------------------------------------------------------------
    # 5. public driver
    # ------------------------------------------------------------------
    def run(self) -> Dict:
        self._load_and_melt()
        self._add_lags()
        self._make_sequences()
        self._split_and_scale()
        logging.info("Pre‑processing complete – ready for global LSTM")
        return {
            "splits": self.splits,
            "lookback": self.lookback,
            "n_numeric": self.seq_X.shape[2] - 1,  # excluding zip_id
            "scaler_X": self.scaler_X,
            "scaler_y": self.scaler_y,
            "zip_lookup": self.zip_lookup,
            "horizon": self.horizon
        }

    def get_last_12_adjusted_prices(self, zip_code: int) -> pd.Series:
        df_zip = self.long[self.long.RegionName == zip_code].sort_values("date")
        return df_zip["price"].iloc[-12:].reset_index(drop=True)

if __name__ == "__main__":
    p = MultiZipPreprocessor(
        "Datasets_HOME_VALUES/Zip_zhvi_bdrmcnt_3_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv",
        lookback=24,
    )
    out = p.run()
    print("Train shape", out["splits"]["train"][0].shape)
