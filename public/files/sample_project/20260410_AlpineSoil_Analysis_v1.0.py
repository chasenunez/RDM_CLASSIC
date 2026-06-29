# Alpine Soil Study — data processing pipeline
# Reads raw soil chemistry and humidity data, merges on site ID,
# computes per-site means, and writes results to Excel.

import pandas as pd
import numpy as np

# Load soil chemistry data; header is on row index 2 (rows 0-1 are title/notes)
df = pd.read_excel("soil samples.xlsx", header=2)

# Load temperature/humidity sensor export
df2 = pd.read_excel("temp&humidity_data_FINAL.xlsx")

# Drop rows with any missing values before computing derived fields
df = df.dropna()

# Compute ratio of bulk density (col3) to soil moisture (col1)
df['ratio'] = df['col3'] / df['col1']

# Retain only positive humidity readings (sensor artefact: negative values are noise)
df2 = df2[df2['val'] > 0]

# Merge on shared site identifier
merged = pd.merge(df, df2, on='id')
merged.to_excel("cleaned data.xlsx", index=False)

# Summarise by site
result = merged.groupby('site').mean()
result.to_excel("results_final.xlsx")
