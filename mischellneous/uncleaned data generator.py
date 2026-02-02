import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

np.random.seed(42)

ROWS = 500

# -----------------------------
# Generate base data
# -----------------------------
data = {
    "customer_id": range(1, ROWS + 1),

    # Age: normal + missing + insane outliers
    "age": np.random.normal(35, 10, ROWS).round(),

    # Income: skewed + missing + huge outliers
    "income": np.random.lognormal(mean=10, sigma=0.6, size=ROWS).round(),

    # Gender: messy categories
    "gender": np.random.choice(
        ["Male", "Female", "M", "F", "Unknown", None],
        size=ROWS,
        p=[0.35, 0.35, 0.1, 0.1, 0.05, 0.05]
    ),

    # City with missing
    "city": np.random.choice(
        ["Chennai", "Bangalore", "Mumbai", "Delhi", None],
        size=ROWS,
        p=[0.25, 0.25, 0.2, 0.2, 0.1]
    ),

    # Signup date
    "signup_date": [
        datetime(2018, 1, 1) + timedelta(days=random.randint(0, 2000))
        for _ in range(ROWS)
    ],

    # Purchase amount with heavy outliers
    "last_purchase_amount": np.random.exponential(scale=3000, size=ROWS).round(),

    # Churn flag
    "churn": np.random.choice(
        ["Yes", "No", None],
        size=ROWS,
        p=[0.3, 0.65, 0.05]
    )
}

df = pd.DataFrame(data)

# -----------------------------
# Inject missing values
# -----------------------------
for col in ["age", "income", "last_purchase_amount"]:
    df.loc[df.sample(frac=0.1).index, col] = np.nan

# -----------------------------
# Inject extreme outliers
# -----------------------------
df.loc[df.sample(5).index, "age"] = [150, 200, -10, 999, 300]
df.loc[df.sample(5).index, "income"] = [1e7, 5e7, 1e8, 99999999, 25000000]
df.loc[df.sample(5).index, "last_purchase_amount"] = [500000, 750000, 1e6, 2e6, 999999]

# -----------------------------
# Save CSV
# -----------------------------
output_path = "dirty_customer_data.csv"
df.to_csv(output_path, index=False)

print(f"Dataset created: {output_path}")
print(df.head(10))
