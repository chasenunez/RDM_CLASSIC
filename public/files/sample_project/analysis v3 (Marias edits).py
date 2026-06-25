import pandas as pd
import numpy as np
df = pd.read_excel("soil samples.xlsx", header=2)
df2 = pd.read_excel("temp&humidity_data_FINAL.xlsx")
df = df.dropna()
df['ratio'] = df['col3'] / df['col1']
df2 = df2[df2['val'] > 0]
merged = pd.merge(df, df2, on='id')
merged.to_excel("cleaned data.xlsx", index=False)
# Maria: I changed the threshold to 0.5
result = merged[merged['ratio'] > 0.5].groupby('site').mean()
result.to_excel("results_final.xlsx")
