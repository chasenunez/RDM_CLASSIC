# Alpine Soil Survey — Spring Campaign 2026

**Project:** Soil Carbon Dynamics in Alpine Ecosystems
**Principal Investigator:** Alejandro Rodríguez (WSL)
**Contact:** alejandro.rodriguez@wsl.ch
**Collection dates:** 2026-03-01 to 2026-04-30
**Location:** Swiss National Park (46.65°N, 10.18°E)
**Funding:** Swiss National Science Foundation, grant 200021_207384

---

## Project Overview

This dataset contains soil chemistry, temperature, and humidity measurements from ten high-elevation sites in the Swiss National Park collected during the 2026 spring snowmelt campaign.

---

## File Overview

| File | Description |
|------|-------------|
| `20260315_AlpineSoil_Chem_v1.csv` | Raw soil chemistry measurements (10 sites, 14-day intervals) |
| `20260401_AlpineSoil_TempHumidity_v1.csv` | Continuous temperature and humidity sensor data |
| `20260410_AlpineSoil_Processed_v1.csv` | Cleaned and QC'd data, outliers removed |
| `20260501_AlpineSoil_Manuscript_v0.1.md` | Manuscript draft for journal submission |
| `data_dictionary.md` | Variable definitions and units for all data files |
| `LICENSE` | CC BY 4.0 license |

---

## Methodological Notes

- Soil cores: 10 cm depth, 5 cm diameter, n = 3 per site per sampling date
- OC analysis: Loss-on-ignition at 550°C, 4 hours (Walthert et al. 2010 protocol)
- pH: 1:2.5 soil:water suspension
- **Site 7 sensor malfunction:** Temperature and humidity sensor at site B2 failed 2026-03-12 to 2026-03-18. Affected rows marked with NA; do not interpolate without flagging.
- Missing value code: `NA` (used consistently throughout all data files)

---

## How to reproduce the analysis

```
Rscript 20260410_AlpineSoil_Analysis_v1.0.R
```

Requires R ≥ 4.3 and packages listed in `requirements.txt`.

---

## Citation

Rodríguez A., Kovač M., Lindström J. (2026). *Alpine soil carbon dataset, Swiss National Park spring 2026.* EnviDat. https://doi.org/10.16904/envidat.XXXX

---

## License

Data: CC BY 4.0 — see `LICENSE`
Code: MIT License
