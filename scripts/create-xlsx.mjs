/**
 * create-xlsx.mjs
 * Generates all .xlsx sample files for the RDM Scavenger Hunt.
 * Run: node scripts/create-xlsx.mjs
 */
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'files', 'sample_project');

function writeSheet(filename, data) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, path.join(OUT, filename));
  console.log(`  ✓ ${filename}`);
}

// ── soil samples.xlsx — boss battle data with all quality issues ──────────────
writeSheet('soil samples.xlsx', [
  ['Alpine Soil Survey - Spring Campaign', '', '', '', '', '', ''],
  ['', '', '', '', '', 'site 7 sensor broken in March', ''],
  ['id', 'col1', 'col2', 'col3', 'pH', 'temp', 'notes'],
  [1, 12.3, 45.6, 3.4, 6.8, 23.4, ''],
  [2, 15.1, 42.1, 4.1, 7.2, 24.1, ''],
  [3, 11.8, 'NA', 2.9, 6.5, '', ''],
  [4, 14.2, 44.3, 3.8, 'n/a', 22.9, 'weird value'],
  [5, 13.5, 46.0, 3.6, 7.1, 23.7, ''],
  [6, 16.0, 43.2, 4.5, 6.9, 24.5, ''],
  [7, '', '', '', -999, -999, 'sensor broken'],
  [8, 12.7, 45.1, 3.3, 7.0, 23.2, ''],
  [9, 11.2, 47.8, 2.7, '??', 22.8, 'check this'],
  [10, 14.8, 44.0, 4.0, 7.3, 24.0, ''],
]);

// ── temp&humidity files — versioning naming problems ─────────────────────────
const thData1 = [
  ['date', 'site_id', 'temperature_C', 'humidity_pct', 'sensor_id'],
  ['2026-03-01', 'A1', 12.4, 65.2, 'S1'],
  ['2026-03-01', 'A2', 11.8, 68.5, 'S1'],
  ['2026-03-02', 'A1', 13.1, 63.0, 'S1'],
  ['2026-03-02', 'A2', 12.6, 66.8, 'S1'],
  ['2026-03-03', 'A1', 11.5, 70.1, 'S2'],
  ['2026-03-03', 'A2', 10.9, 72.4, 'S2'],
  ['2026-03-04', 'A1', 14.0, 61.5, 'S2'],
  ['2026-03-04', 'A2', 13.2, 64.9, 'S2'],
];

writeSheet('temp_humidity_FINAL.xlsx', thData1);

const thData2 = [...thData1, ['2026-03-05', 'A1', 13.8, 62.3, 'S2'], ['2026-03-05', 'A2', 13.0, 65.7, 'S2']];
writeSheet('temp_humidity_FINAL_v2.xlsx', thData2);

const thData3 = [...thData2, ['2026-03-06', 'A1', 12.9, 63.8, 'S3'], ['2026-03-06', 'A2', 12.1, 67.2, 'S3']];
writeSheet('temp_humidity_REALLY FINAL.xlsx', thData3);

// ── cleaned data.xlsx ─────────────────────────────────────────────────────────
writeSheet('cleaned data.xlsx', [
  ['sample_id', 'soil_moisture', 'organic_carbon', 'pH', 'temperature', 'site'],
  [1, 12.3, 45.6, 6.8, 23.4, 'A1'],
  [2, 15.1, 42.1, 7.2, 24.1, 'A1'],
  [3, 11.8, 41.2, 6.5, 22.8, 'A2'],
  [5, 13.5, 46.0, 7.1, 23.7, 'A2'],
  [6, 16.0, 43.2, 6.9, 24.5, 'B1'],
  [8, 12.7, 45.1, 7.0, 23.2, 'B1'],
  [10, 14.8, 44.0, 7.3, 24.0, 'B2'],
]);

// ── data_new.xlsx and data_new(1).xlsx ────────────────────────────────────────
const rawData = [
  ['id', 'val1', 'val2', 'val3', 'collected'],
  [1, 23.4, 5.6, 78.9, '2026-03-01'],
  [2, 24.1, 6.1, 80.2, '2026-03-01'],
  [3, 22.8, 5.3, 77.4, '2026-03-02'],
  [4, 25.0, 6.4, 81.0, '2026-03-02'],
  [5, 23.9, 5.8, 79.5, '2026-03-03'],
];
writeSheet('data_new.xlsx', rawData);
writeSheet('data_new(1).xlsx', rawData);

// ── results_final.xlsx ────────────────────────────────────────────────────────
writeSheet('results_final.xlsx', [
  ['site', 'mean_pH', 'std_pH', 'n_samples', 'mean_moisture', 'mean_OC'],
  ['A1', 6.95, 0.24, 15, 13.4, 44.2],
  ['A2', 7.05, 0.19, 14, 12.9, 43.7],
  ['B1', 6.88, 0.31, 16, 14.1, 45.0],
  ['B2', 7.12, 0.22, 15, 13.8, 44.6],
]);

console.log('\nAll xlsx files created in', OUT);
