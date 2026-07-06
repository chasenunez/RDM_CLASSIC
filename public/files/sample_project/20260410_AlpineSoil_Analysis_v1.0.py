# =============================================================================
# Alpine Soil Study - data processing pipeline
# Author:  J. Keller  (j.keller@example.edu)
# Created: 2026-04-10
#
# Computes per-site summary statistics from the cleaned soil-chemistry data
# and writes a derived results table. All paths are relative to the project
# root and match the folder layout created by the file-structure fix
# (data/, code/, manuscripts/), so the script runs on any machine after a
# `git clone` with no edits.
# =============================================================================

import logging
from pathlib import Path

import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")

# Relative path into the project's data/ folder - no hardcoded locations
DATA_DIR = Path("data")

# --- Load input --------------------------------------------------------------
# Cleaned soil chemistry produced by the data-quality fix. The header is the
# first row now (the title/notes rows were removed), so no header offset is
# needed as it was in the old script.
soil = pd.read_excel(DATA_DIR / "20260315_AlpineSoil_Chem_v1.xlsx")

# --- Clean & derive ----------------------------------------------------------
# Drop rows with any missing values before summarising
soil = soil.dropna()

# Use the descriptive column names from the README data dictionary
# (site_id, soil_moisture_pct, air_temperature_degC) instead of col1 / col3.
site_means = soil.groupby("site_id")[
    ["soil_moisture_pct", "air_temperature_degC", "pH"]
].mean()

# --- Write results -----------------------------------------------------------
# Derived summary is written back into data/ with a descriptive, versioned
# filename dated to this analysis run.
out_path = DATA_DIR / "20260410_AlpineSoil_SiteMeans_v1.xlsx"
site_means.to_excel(out_path)

# Record what the run produced so results are traceable
logging.info("Computed site means for %d sites -> %s", len(site_means), out_path)
