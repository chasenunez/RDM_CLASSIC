# Alpine Soil Survey — Spring Campaign

## General information

- **Project title:** Alpine Soil Chemistry Survey (Spring Campaign)
- **Principal investigator:** Dr. J. Keller, Institute of Alpine Ecology
- **Contact:** j.keller@example.edu
- **Dates of data collection:** 2026-03-01 to 2026-05-01
- **Geographic location:** Eastern Alpine range, 1,800–2,400 m elevation
- **Funding:** National Research Council, Grant #AE-2026-114

## Data and file overview

| File | Description |
| --- | --- |
| `raw_data.xlsx` | Field measurements, one row per sample site |
| `20260315_AlpineSoil_Chem_v1.xlsx` | Cleaned soil chemistry results |
| `20260410_AlpineSoil_Analysis_v1.0.py` | Analysis script (Python 3) |

## Methodological information

Soil cores were collected at 24 sites along an elevation gradient using a
standard 5 cm auger. Samples were air-dried and analyzed for pH, organic
carbon, and total nitrogen. Quality control: each site sampled in triplicate;
outliers beyond 3 SD flagged during cleaning.

## Data-specific information

- `site_id` — unique site identifier
- `elevation_m` — elevation in meters above sea level
- `soil_moisture_pct` — gravimetric soil moisture (%)
- `air_temperature_degC` — air temperature at sampling (°C)
- `pH` — soil pH (1:2.5 soil:water)
- Missing values are recorded as blank cells.

## Sharing and access information

- **License:** CC BY 4.0 — see `LICENSE.md`.
- **How to cite:** Keller, J. (2026). *Alpine Soil Chemistry Survey — Spring
  Campaign* [Data set]. Institute of Alpine Ecology.
