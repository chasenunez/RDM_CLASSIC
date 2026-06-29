# Data Dictionary — Alpine Soil Survey 2026

This file documents all variables in the dataset.

---

## soil chemistry file (`20260315_AlpineSoil_Chem_v1.csv`)

| Variable | Type | Units | Description | Valid range | Missing code |
|----------|------|-------|-------------|------------|--------------|
| `sample_id` | integer | — | Unique sample identifier | 1–150 | — |
| `site_id` | string | — | Site code (A1–B2) | — | — |
| `collection_date` | date | YYYY-MM-DD | Date of soil core collection | 2026-03-01 to 2026-04-30 | — |
| `soil_moisture_pct` | float | % by mass | Gravimetric soil moisture | 5–80 | NA |
| `organic_carbon_g_per_kg` | float | g/kg dry soil | Loss-on-ignition organic carbon | 10–100 | NA |
| `pH` | float | pH units | Soil pH in 1:2.5 water suspension | 3.5–8.5 | NA |
| `air_temperature_degC` | float | °C | Air temperature at 2 m height | −20 to +30 | NA |
| `depth_cm` | integer | cm | Core depth | 5 or 10 | — |

---

## temperature/humidity file (`20260401_AlpineSoil_TempHumidity_v1.csv`)

| Variable | Type | Units | Description | Valid range | Missing code |
|----------|------|-------|-------------|------------|--------------|
| `timestamp` | datetime | YYYY-MM-DD HH:MM | Measurement time (UTC+1) | — | — |
| `site_id` | string | — | Site code (A1–B2) | — | — |
| `soil_temp_5cm_degC` | float | °C | Soil temperature at 5 cm depth | −10 to +25 | NA |
| `soil_temp_10cm_degC` | float | °C | Soil temperature at 10 cm depth | −10 to +25 | NA |
| `volumetric_water_pct` | float | % vol/vol | Volumetric soil moisture | 5–75 | NA |
| `sensor_id` | string | — | Sensor unit ID (S1–S3) | — | — |
| `qc_flag` | integer | — | Quality control flag: 0=OK, 1=suspect, 2=failed | 0–2 | — |

---

## Notes

- All missing values are coded as `NA` throughout all files.
- `-999` was used as a missing value placeholder in earlier versions of the data; **do not use** — all such entries have been converted to `NA` in v1.0.
- The `qc_flag = 2` entries at site B2 correspond to the sensor malfunction of 2026-03-12 to 2026-03-18.

---

*Created:* 2026-04-20
*Last updated:* 2026-05-01
*Contact:* alejandro.rodriguez@wsl.ch
