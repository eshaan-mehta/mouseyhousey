# lstm_trainer_multizip_v1.py
"""Trainer wired to *MultiZipPreprocessor* (global panel model).

Key points
-----------
* Two inputs: numeric features and `zip_id` integer sequence.
* `zip_id` passes through an Embedding layer and is concatenated with numeric
  timesteps.
* Metrics are reported in **real dollars** via inverse–transform.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict

import numpy as np
import tensorflow as tf
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.layers import (Concatenate, Dense, Dropout, Embedding, Input,
                                     LSTM)
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam

from lstm_simple_preprocessing import MultiZipPreprocessor

logging.basicConfig(level=logging.INFO, format="%(asctime)s ▶ %(message)s")


class GlobalLSTMTrainer:
    """Train a single global LSTM for all ZIPs of one housing‑type file."""

    def __init__(self, data_path: str | Path, lookback: int = 24):
        self.data_path = Path(data_path)
        self.lookback = lookback
        self.prep: MultiZipPreprocessor | None = None
        self.out: Dict | None = None
        self.model: Model | None = None
        self.history = None

    # ------------------------------------------------------------------
    def preprocess(self) -> Dict:
        self.prep = MultiZipPreprocessor(self.data_path, lookback=self.lookback)
        self.out = self.prep.run()
        return self.out

    # ------------------------------------------------------------------
    def build_model(self, lstm_units=(128, 64), dropout=0.2, emb_dim=16) -> Model:
        if self.out is None:
            raise RuntimeError("Call preprocess() first")

        n_num = self.out["n_numeric"]     # numeric features per timestep
        n_zip = len(self.out["zip_lookup"])

        # inputs
        num_in = Input((self.lookback, n_num), name="num_in")
        zip_in = Input((self.lookback,), dtype="int32", name="zip_in")

        # embedding for zip_id (same id repeated across a window, but fine)
        z = Embedding(n_zip, emb_dim, name="zip_emb")(zip_in)  # (B, L, emb_dim)

        x = Concatenate(axis=-1)([num_in, z])
        x = LSTM(lstm_units[0], return_sequences=True)(x)
        x = Dropout(dropout)(x)
        x = LSTM(lstm_units[1])(x)
        x = Dropout(dropout)(x)
        out = Dense(1)(x)

        self.model = Model([num_in, zip_in], out)
        self.model.compile(optimizer=Adam(1e-3), loss="mse", metrics=["mae"])
        self.model.summary(print_fn=logging.info)
        return self.model

    # ------------------------------------------------------------------
    def _split_inputs(self, X: np.ndarray):
        """Split combined tensor into numeric + zip parts for model input."""
        n_num = self.out["n_numeric"]
        num = X[:, :, :n_num]
        zid = X[:, :, n_num:].astype("int32")  # one int column
        return [num, zid.squeeze(-1)]

    # ------------------------------------------------------------------
    def train(self, epochs=100, batch=64, patience=10):
        if self.model is None:
            raise RuntimeError("Build model first")
        X_train, y_train = self.out["splits"]["train"]
        X_val,   y_val   = self.out["splits"]["val"]

        callbacks = [
            EarlyStopping(patience=patience, monitor="val_loss", restore_best_weights=True),
            ReduceLROnPlateau(patience=patience//2, monitor="val_loss", factor=0.5, verbose=1),
            ModelCheckpoint("best_global_lstm.h5", save_best_only=True, monitor="val_loss", verbose=0),
        ]

        self.history = self.model.fit(
            self._split_inputs(X_train),
            y_train,
            validation_data=(self._split_inputs(X_val), y_val),
            epochs=epochs,
            batch_size=batch,
            verbose=1,
            callbacks=callbacks,
        )
        return self.history

    # ------------------------------------------------------------------
    def evaluate(self):
        if self.model is None:
            raise RuntimeError("Need a trained model")
        X_test, y_test_scaled = self.out["splits"]["test"]
        y_pred_scaled = self.model.predict(self._split_inputs(X_test)).ravel()

        # inverse‑scale
        scaler_y = self.out["scaler_y"]
        y_test = scaler_y.inverse_transform(y_test_scaled.reshape(-1, 1)).ravel()
        y_pred = scaler_y.inverse_transform(y_pred_scaled.reshape(-1, 1)).ravel()

        rmse = mean_squared_error(y_test, y_pred, squared=False)
        mae  = mean_absolute_error(y_test, y_pred)
        mape = mean_absolute_percentage_error(y_test, y_pred) * 100
        logging.info("Test → RMSE $%.0f | MAE $%.0f | MAPE %.2f%%", rmse, mae, mape)
        return dict(rmse=rmse, mae=mae, mape=mape)


if __name__ == "__main__":
    trainer = GlobalLSTMTrainer(
        "Datasets_HOME_VALUES/Zip_zhvi_bdrmcnt_3_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv",
        lookback=24,
    )
    trainer.preprocess()
    trainer.build_model()
    trainer.train(epochs=30)
    trainer.evaluate()
