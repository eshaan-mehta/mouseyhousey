# quantum_delta_regressor.py
# ---------------------------------------------------------------------------
# Learn  g(score, error)  ➜  delta  with a 2-qubit variational regressor
# and save everything needed for production inference.
# ---------------------------------------------------------------------------

# ─────────────────────────────────────────────────────────────────────────────
# 0.  Imports
# ─────────────────────────────────────────────────────────────────────────────
import numpy as np
import pandas as pd
import pennylane as qml
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset

# ─────────────────────────────────────────────────────────────────────────────
# 1.  Load CSV and prepare tensors
# ─────────────────────────────────────────────────────────────────────────────
CSV_PATH = "sales/Datasets_HOME_VALUE/delta_training_data.csv"      # ◀─ put your file here
SCALE    = 1e4                            # Δ is learned in “tens-of-thousands”

df = pd.read_csv(CSV_PATH, usecols=["score", "error", "delta"]).dropna()
assert {"score", "error", "delta"} <= set(df.columns)

s_min, s_max = df["score"].min(),  df["score"].max()
e_min, e_max = df["error"].min(),  df["error"].max()

def _angle(v, lo, hi):
    """
    Map v∈[lo,hi] → [-π, π] so that inputs sit in a smooth range
    for the RY encoding.
    """
    v = v.astype("float32")
    return 2 * np.pi * (v - lo) / (hi - lo + 1e-12) - np.pi

X = np.stack(
        [
            _angle(df["score"].values, s_min, s_max),
            _angle(df["error"].values, e_min, e_max)
        ],
        axis=1,                              # shape (N, 2)
    ).astype("float32")

# ❶ RESCALE:  teach the network Δ/10 000  → output is O(±2.5)
y = (df["delta"].values.astype("float32") / SCALE)[:, None]       # (N,1)

loader = DataLoader(
    TensorDataset(torch.tensor(X), torch.tensor(y)),
    batch_size=32,
    shuffle=True,
)

# ─────────────────────────────────────────────────────────────────────────────
# 2.  Quantum circuit + PyTorch wrapper
# ─────────────────────────────────────────────────────────────────────────────
N_QUBITS = 2
dev = qml.device("lightning.qubit", wires=N_QUBITS)

def feature_map(x):
    qml.RY(x[0], wires=0)
    qml.RY(x[1], wires=1)
    qml.CNOT(wires=[0, 1])

def ansatz(weights):
    for i in range(N_QUBITS):
        qml.Rot(*weights[i], wires=i)
    qml.CNOT(wires=[0, 1])

@qml.qnode(dev, interface="torch")
def circuit(x, weights):
    feature_map(x)
    ansatz(weights)
    return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]

class VariationalRegressor(nn.Module):
    """
    Quantum → tiny classical head  (2 exp-vals ➜ 1 scalar)
    """
    def __init__(self):
        super().__init__()
        # three Euler angles per qubit
        self.theta = nn.Parameter(0.01 * torch.randn(N_QUBITS, 3))
        self.fc    = nn.Linear(N_QUBITS, 1, bias=True)

    def forward(self, x):                     # x: (batch, 2)
        out = [torch.stack(circuit(row, self.theta)) for row in x]
        out = torch.stack(out)                # (batch, 2)
        return self.fc(out)                   # (batch, 1)

# ─────────────────────────────────────────────────────────────────────────────
# 3.  Train
# ─────────────────────────────────────────────────────────────────────────────
model   = VariationalRegressor()
optim   = torch.optim.Adam(model.parameters(), lr=1e-2)
loss_fn = nn.MSELoss()
#
# EPOCHS = 200
# for epoch in range(1, EPOCHS + 1):
#     for xb, yb in loader:
#         pred = model(xb)
#         loss = loss_fn(pred, yb)
#         loss.backward()
#         optim.step()
#         optim.zero_grad()
#     if epoch == 1 or epoch % 20 == 0:
#         print(f"epoch {epoch:3d}   train-MSE: {loss.item():,.4f}")

# ─────────────────────────────────────────────────────────────────────────────
# 4.  Convenience wrappers
# ─────────────────────────────────────────────────────────────────────────────
def predict_delta(score: float, error: float) -> float:
    """
    Return Δ **in dollars** (remember to re-multiply by SCALE).
    """
    x_scaled = np.array(
        [
            _angle(np.array([score]), s_min, s_max)[0],
            _angle(np.array([error]), e_min, e_max)[0],
        ],
        dtype="float32",
    )
    x_tensor = torch.tensor(x_scaled).unsqueeze(0)  # (1,2)
    with torch.no_grad():
        return float(model(x_tensor).squeeze()) * SCALE

# ─────────────────────────────────────────────────────────────────────────────
# 5.  Persist weights + meta so production can reload identically
# ─────────────────────────────────────────────────────────────────────────────
WEIGHTS_FILE = "qdelta_state_dict.pt"
META_FILE    = "qdelta_meta.npy"          # stores min/max + SCALE

def save_qdelta(
    weights_path: str = WEIGHTS_FILE,
    meta_path: str = META_FILE,
):
    torch.save(model.state_dict(), weights_path)
    np.save(meta_path, np.array([s_min, s_max, e_min, e_max, SCALE]))

def load_qdelta(
    weights_path: str = WEIGHTS_FILE,
    meta_path: str = META_FILE,
):
    s_min_, s_max_, e_min_, e_max_, scale_ = np.load(meta_path)
    reg = VariationalRegressor()
    reg.load_state_dict(torch.load(weights_path, map_location="cpu"))
    reg.eval()

    def _predict(score, error):
        x_scaled = np.array(
            [
                _angle(np.array([score]), s_min_, s_max_)[0],
                _angle(np.array([error]), e_min_, e_max_)[0],
            ],
            dtype="float32",
        )
        with torch.no_grad():
            return float(reg(torch.tensor(x_scaled).unsqueeze(0)).squeeze()) * scale_

    return _predict

# ─────────────────────────────────────────────────────────────────────────────
# 6.  Demo – run only when executed directly
# ─────────────────────────────────────────────────────────────────────────────
def get_delta(s_ex,e_ex):
    # quick example before saving
    print("\nBefore saving:")
    print(f"score={s_ex}, error={e_ex:+,.0f} → delta ≈ {predict_delta(s_ex, e_ex):+,.0f}")

    # persist
    save_qdelta()

    # fresh reload & re-test
    g = load_qdelta()
    print("After reload:")
    print(f"score={s_ex}, error={e_ex:+,.0f} → delta ≈ {g(s_ex, e_ex):+,.0f}")
    return g(s_ex, e_ex)
