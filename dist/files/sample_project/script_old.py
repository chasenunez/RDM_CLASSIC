import pandas as pd
df = pd.read_excel("soil samples.xlsx")
df.dropna()
df['ratio'] = df['col3'] / df['col1']
df.to_excel("cleaned data.xlsx")
