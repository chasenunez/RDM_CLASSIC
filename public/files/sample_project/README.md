# Alpine Soil Survey, Spring Campaign

## General information

- **Project title:** Alpine Soil Chemistry Survey (Spring Campaign)
- **Principal investigator:** Dr. J. Keller, Institute of Alpine Ecology
- **Contact:** j.keller@example.edu
- **Dates of data collection:** 2026-03-01 to 2026-05-01
- **Geographic location:** Eastern Alpine range, 1,800 to 2,400 m elevation
- **Funding:** National Research Council, Grant #AE-2026-114

## Data and file overview

Files are grouped by role, so it is clear which are inputs and which are outputs:

| File | Description |
| --- | --- |
| `data/raw_alpine_soil_data.csv` | Original field measurements, one row per sample site. Read-only; never edited. Keeps the name it arrived with. |
| `data/20260315_AlpineSoil_Chem_v1.0.csv` | Cleaned soil chemistry, derived from the raw file. This is the table to analyse. |
| `code/20260410_AlpineSoil_Analysis_v1.0.py` | Analysis script (Python 3). Reads the cleaned file, writes per-site means. |
| `figures/20260420_AlpineSoil_Fig1_RatioBySite_v1.0.png` | Regression of the measured ratio against site. Figure 1 of the manuscript. |
| `figures/20260322_AlpineSoil_Microscopy_Sample12_v1.0.png` | Microscopy image of sample 12, kept lossless. |
| `manuscripts/20260501_AlpineSoil_Manuscript_v1.0.docx` | First complete draft. |
| `manuscripts/20260501_AlpineSoil_Manuscript_v1.1.docx` | Draft revised after co-author review. |
| `LICENSE.md` | Licence terms for the data and the code. |

Both data files are stored as CSV, so they can be read without Excel. Every
file except the raw one is named
`YYYYMMDD_ProjectName_DocumentType_Version.extension`; the raw file keeps its
original name because that name is part of its provenance.

## Methodological information

Soil cores were collected at 10 sites along an elevation gradient using a
standard 5 cm auger. Samples were air-dried, then analysed for pH, organic
carbon, bulk density, and gravimetric moisture; air temperature was logged at
the time of sampling. Quality control: each site sampled in triplicate, with
outliers beyond 3 SD flagged during cleaning.

Site 7 is missing its measurement values because the sensor failed in March.
Those cells carry the missing-value code rather than a substituted estimate.

## Data-specific information

Every column in the cleaned file:

- `site_id`: unique site identifier
- `soil_moisture_pct`: gravimetric soil moisture (%)
- `organic_carbon_g_per_kg`: organic carbon content (g/kg)
- `bulk_density_g_per_cm3`: dry bulk density (g/cm³)
- `pH`: soil pH (1:2.5 soil:water)
- `air_temperature_degC`: air temperature at sampling (°C)
- `notes`: free-text field observations; blank where there was nothing to record

**Missing values are recorded as `NA`.** This is the only missing-value code
used anywhere in the data. Cells are never left blank in a measurement column,
because a blank cannot be told apart from "not collected", "below detection
limit", or a typing slip.

## Sharing and access information

- **Licence:** CC BY 4.0. See `LICENSE.md`.
- **How to cite:** Keller, J. (2026). *Alpine Soil Chemistry Survey, Spring
  Campaign* [Data set]. Institute of Alpine Ecology.
