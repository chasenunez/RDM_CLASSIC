# =============================================================================
# Alpine Soil Study - data processing pipeline
# Author:  J. Keller  (j.keller@example.edu)
# Created: 2026-04-10
#
# Reads cleaned soil-chemistry and humidity sensor data, merges them on site
# ID, computes per-site means, and writes the results. All paths are relative
# to the project root, so the script runs on any machine after `git clone`
# with no edits.
# =============================================================================

import logging
from pathlib import Path

import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")

# Relative paths only - no hardcoded absolute or user-specific locations
DATA_DIR = Path("data")
RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)

# --- Load inputs -------------------------------------------------------------
# Cleaned soil chemistry. The header is now the first row (the title/notes rows
# were removed as part of the data-quality fix), so no header offset is needed.
soil = pd.read_excel(DATA_DIR / "20260315_AlpineSoil_Chem_v1.xlsx")

# Temperature / humidity sensor export
sensors = pd.read_excel(DATA_DIR / "temp_humidity_data_v1.xlsx")

# --- Clean & derive ----------------------------------------------------------
# Drop rows with any missing values before computing derived fields
soil = soil.dropna()

# Descriptive column names instead of the ambiguous col1 / col3
soil["bulk_density_to_moisture_ratio"] = (
    soil["bulk_density_g_cm3"] / soil["soil_moisture_pct"]
)

# Keep only valid positive humidity readings (negatives are sensor noise)
sensors = sensors[sensors["humidity_pct"] > 0]

# --- Merge & summarise -------------------------------------------------------
merged = pd.merge(soil, sensors, on="site_id")
merged.to_excel(RESULTS_DIR / "merged_data_v1.xlsx", index=False)

# Per-site means, written with a descriptive, versioned filename
site_means = merged.groupby("site_id").mean(numeric_only=True)
site_means.to_excel(RESULTS_DIR / "site_means_v1.xlsx")

# Record what the run produced so results are traceable
logging.info(
    "Processed %d merged rows across %d sites -> %s",
    len(merged), len(site_means), RESULTS_DIR,
)
