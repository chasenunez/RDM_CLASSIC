/**
 * build-content.mjs
 *
 * Runs before vite build (and manually before dev). Extracts the messy project
 * archive, parses the answer key, copies icons, and generates all data JSON files.
 *
 * Source paths are read from env vars so CI or other users can override:
 *   RDM_SOURCE_REPO   default: ~/PANTHEON/RDM_BASICS
 *   RDM_ICONS_DIR     default: ~/PANTHEON/Classic-Mac-icons
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream } from 'fs';
import tar from 'tar';

// ── Source paths ─────────────────────────────────────────────────────────────

const HOME = os.homedir();

const RDM_SOURCE_REPO =
  process.env.RDM_SOURCE_REPO ?? path.join(HOME, 'PANTHEON', 'RDM_BASICS');

const RDM_ICONS_DIR =
  process.env.RDM_ICONS_DIR ?? path.join(HOME, 'PANTHEON', 'Classic-Mac-icons');

const TARBALL = path.join(
  RDM_SOURCE_REPO,
  'RDM_SCAVENGER_HUNT',
  'sample_messy_project.tar.gz',
);

const ANSWER_KEY = path.join(
  RDM_SOURCE_REPO,
  '.git',
  'info',
  'RDM_Problems_and_Fixes_Guide.md',
);

// ── Output paths (relative to project root) ──────────────────────────────────

const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PUBLIC_FILES = path.join(PROJECT_ROOT, 'public', 'files');
const PUBLIC_ICONS = path.join(PROJECT_ROOT, 'public', 'icons');
const PUBLIC_DOWNLOADS = path.join(PROJECT_ROOT, 'public', 'downloads');
const SRC_DATA = path.join(PROJECT_ROOT, 'src', 'data');

const OUT_FILE_TREE = path.join(SRC_DATA, 'file-tree.json');
const OUT_PROBLEMS = path.join(SRC_DATA, 'problems.json');
const OUT_MAPPING = path.join(SRC_DATA, 'mapping.json');
const OUT_MAPPING_PROPOSAL = path.join(SRC_DATA, 'mapping.proposal.json');
const OUT_ICON_MANIFEST = path.join(PUBLIC_ICONS, 'manifest.json');
const OUT_GUIDE_HTML = path.join(PUBLIC_DOWNLOADS, 'RDM_Guide.html');

// ── Icon mapping for file types ───────────────────────────────────────────────

const EXT_ICON_MAP = {
  '.txt': 'Text file',
  '.md': 'Text file',
  '.csv': 'Text file',
  '.xlsx': 'Text file',
  '.docx': 'Text file',
  '.py': 'THINK Pascal',
  '.r': 'THINK Pascal',
  '.sh': 'THINK Pascal',
  '.jpg': 'Paint file',
  '.jpeg': 'Paint file',
  '.png': 'Paint file',
  '.tif': 'Paint file',
  '.tiff': 'Paint file',
  '.dat': 'Draw file',
};
const DEFAULT_ICON = 'Text file';

function iconForFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return EXT_ICON_MAP[ext] ?? DEFAULT_ICON;
}

function mimeGuess(filename) {
  const ext = path.extname(filename).toLowerCase();
  const MAP = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.csv': 'text/csv',
    '.py': 'text/x-python',
    '.r': 'text/x-r',
    '.sh': 'application/x-sh',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
    '.dat': 'application/octet-stream',
  };
  return MAP[ext] ?? 'application/octet-stream';
}

function viewerType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.tif', '.tiff'].includes(ext)) return 'image';
  if (['.csv'].includes(ext)) return 'csv';
  if (['.xlsx'].includes(ext)) return 'xlsx';
  if (['.dat'].includes(ext)) return 'binary';
  if (['.docx'].includes(ext)) return 'markdown';
  return 'text';
}

// Files to exclude from the game's file tree (still on disk, just not shown)
const EXCLUDED_FROM_GAME = new Set([
  'Soil Samples COPY.xlsx',
  'soil_samples_preview.csv',
]);

// ── Step 1: Extract tarball ────────────────────────────────────────────────────

async function extractTarball() {
  console.log('📦 Extracting tarball…');
  fs.mkdirSync(PUBLIC_FILES, { recursive: true });

  // tar preserves original filenames verbatim (spaces, special chars, caps)
  // because they are evidence in the game — do not sanitize.
  await tar.extract({
    file: TARBALL,
    cwd: PUBLIC_FILES,
    // strip the leading "sample_project/" component so files land at public/files/sample_project/
  });

  console.log('   ✓ Extracted to', PUBLIC_FILES);
}

// ── Markdown content for .docx files (replaces binary blobs after extraction) ─

const DOCX_MARKDOWN = {
  'MANUSCRIPT FINAL SUBMISSION.docx': `# Alpine Soil Carbon Dynamics Under Changing Climate Conditions

**Authors:** Maria Rossi¹, James Kim², Anna Petersen¹

¹Institute of Alpine Ecology, Zurich · ²Department of Environmental Sciences, ETH Zurich

---

## Abstract

We investigated soil organic carbon (SOC) dynamics in alpine meadow ecosystems across an elevational gradient (1800–2600 m a.s.l.) in the Swiss Alps during spring 2026. Across 10 sites, SOC concentrations ranged from 11.2 to 16.0 g/kg with soil moisture and temperature as primary predictors. Our results suggest that ongoing warming may significantly alter carbon storage capacity in alpine soils.

---

## 1. Introduction

Alpine soils store substantial amounts of organic carbon but are highly sensitive to climate perturbations. Despite their importance, quantitative data on SOC responses to temperature and moisture variability remain sparse, particularly for early-season conditions.

---

## 2. Methods

### 2.1 Study Sites

Ten sites were established along an elevational gradient in the Albula Alps. At each site, triplicate soil cores (0–10 cm) were collected in early spring (March–April 2026).

### 2.2 Laboratory Analysis

Soil organic carbon was determined by loss-on-ignition at 550°C. Soil moisture was measured gravimetrically. pH was measured in 0.01 M CaCl₂ suspension.

### 2.3 Statistical Analysis

Linear mixed models were fitted using R 4.3.2 (lme4 package). Site was included as a random effect.

---

## 3. Results

SOC concentrations varied significantly across sites (F₉,₂₀ = 8.4, *p* < 0.001). Higher elevation sites showed elevated SOC (mean 15.3 g/kg vs. 12.1 g/kg at low elevation). Temperature explained 47% of variance in SOC (R² = 0.47).

---

## 4. Discussion

Our findings are consistent with the hypothesis that lower temperatures at high elevation slow decomposition rates, promoting SOC accumulation. However, projected warming of 2–4°C by 2100 could substantially increase decomposition rates.

---

## 5. Conclusions

Alpine soils at higher elevations store significantly more organic carbon. Climate warming poses a risk to these stocks. Longitudinal monitoring is urgently needed.

---

## References

- Körner, C. (2021). *Alpine Plant Life*. Springer.
- Scharlemann, J. P. W., et al. (2014). Global soil carbon. *GeoHealth*, 1, 1–10.
- R Core Team (2024). *R: A Language and Environment for Statistical Computing*.
`,

  'analysis_results_USE THIS ONE.docx': `# Analysis Results — Alpine Soil Carbon Study

**DO NOT EDIT — final results as of 2026-04-15**

---

## Summary Statistics

| Site | n | Mean SOC (g/kg) | SD | Mean pH | Mean moisture (%) |
|------|---|---|----|---------|-------------------|
| A1   | 15 | 13.4 | 1.2 | 6.95 | 13.4 |
| A2   | 14 | 12.9 | 1.4 | 7.05 | 12.9 |
| B1   | 16 | 14.1 | 0.9 | 6.88 | 14.1 |
| B2   | 15 | 13.8 | 1.1 | 7.12 | 13.8 |

---

## Regression Results

**Model:** SOC ~ temperature + moisture + pH + (1|site)

| Predictor | Estimate | SE | t | p |
|-----------|----------|----|---|---|
| Intercept | 8.42 | 1.23 | 6.84 | <0.001 |
| temperature_C | −0.31 | 0.08 | −3.87 | <0.001 |
| moisture_pct | 0.44 | 0.11 | 4.00 | <0.001 |
| pH | 0.19 | 0.15 | 1.27 | 0.21 |

R² (conditional) = 0.71

---

## Key Findings

1. Temperature is the strongest predictor of SOC (β = −0.31)
2. Higher moisture is associated with higher SOC accumulation
3. pH shows no significant independent effect

---

*Results generated by analysis v3 (Marias edits).py on 2026-04-14*
`,

  'manuscript draft.docx': `# Draft: Alpine Soil Carbon Dynamics

**Status: DRAFT — do not distribute**

---

## Abstract (draft)

We measured soil organic carbon at 10 alpine sites in spring 2026. Preliminary results suggest elevation and temperature are key predictors. Full statistical analysis pending.

---

## Introduction (incomplete)

Alpine soils are important carbon stores. Climate change may alter carbon dynamics... [EXPAND THIS SECTION — add citations from JK's list]

---

## Methods

Sites were sampled in March and April 2026. See methods_notes.txt for sampling protocol details.

Analysis code in script.py — note: still needs validation.

---

## Results (preliminary)

Initial analysis shows SOC ranges from ~11 to ~16 g/kg across sites. Temperature correlation looks strong (r ≈ −0.7).

[ADD FIGURES — Figure 1.png needs to be regenerated in TIFF format]

---

## TODO

- [ ] Add literature review
- [ ] Finalize statistics
- [ ] Get co-author comments
- [ ] Add data availability statement
`,

  'manuscript_draft_v2_JK comments.docx': `# Draft v2: Alpine Soil Carbon Dynamics
## With comments from JK (James Kim)

---

## Abstract

We measured soil organic carbon at 10 alpine sites in spring 2026. Results indicate elevation and temperature as key predictors of SOC.

> **JK comment:** Abstract is good but add the specific range of SOC values found.

---

## Introduction

Alpine soils store 30% of global soil organic carbon despite covering only 3% of land area (Körner 2021). Climate change is projected to increase alpine temperatures by 2–4°C by 2100, with uncertain effects on SOC dynamics.

> **JK comment:** Need more recent citations here. Also add something about the Swiss Alps specifically.

---

## Methods

Field sampling was conducted at 10 sites along an elevational gradient (1800–2600 m). Triplicate cores (0–10 cm) were collected from each site in March–April 2026.

> **JK comment:** What was the sample volume? Need to state this for reproducibility.

---

## Results

SOC concentrations ranged from 11.2 to 16.0 g/kg. Mixed model results: temperature (β = −0.31, p < 0.001) and moisture (β = 0.44, p < 0.001) were significant predictors.

> **JK comment:** Add the R² value here. Also the F-statistic from the ANOVA.

---

## Discussion

> **JK comment:** This section is too short. Need at least 3 paragraphs comparing to literature.

Our results are consistent with slow decomposition at high elevations promoting SOC accumulation. Projected warming may reverse this trend.

---

*Sent to JK on 2026-03-20*
`,
};

// ── Step 1b: Post-process extracted files ─────────────────────────────────────

async function postProcessFiles() {
  console.log('🔧 Post-processing extracted files…');
  const extracted = path.join(PUBLIC_FILES, 'sample_project');

  // Write markdown content into .docx files
  for (const [filename, content] of Object.entries(DOCX_MARKDOWN)) {
    const dest = path.join(extracted, filename);
    fs.writeFileSync(dest, content, 'utf8');
    console.log(`   ✓ wrote markdown → ${filename}`);
  }

  // Re-run create-xlsx.mjs to overwrite extracted xlsx files with boss battle versions
  const { execSync } = await import('child_process');
  try {
    execSync(`node ${path.join(PROJECT_ROOT, 'scripts', 'create-xlsx.mjs')}`, {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log('   ✓ xlsx boss battle files created');
  } catch (e) {
    console.warn('   ⚠ create-xlsx.mjs failed:', e.message);
  }
}

// ── Step 2: Walk extracted tree → file-tree.json ──────────────────────────────

function walkDir(dir, base) {
  const entries = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    if (EXCLUDED_FROM_GAME.has(name)) continue;
    const fullPath = path.join(dir, name);
    const relPath = path.relative(base, fullPath);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      entries.push({ path: relPath, name, type: 'folder', size: 0, mimeGuess: 'inode/directory', icon: 'folder', viewerType: 'folder' });
      entries.push(...walkDir(fullPath, base));
    } else {
      entries.push({
        path: relPath,
        name,
        type: 'file',
        size: stat.size,
        mimeGuess: mimeGuess(name),
        icon: `/icons/${iconForFile(name)}.svg`,
        viewerType: viewerType(name),
      });
    }
  }
  return entries;
}

function buildFileTree() {
  console.log('🗂  Building file tree…');
  const extracted = path.join(PUBLIC_FILES, 'sample_project');
  if (!fs.existsSync(extracted)) {
    throw new Error(`Extracted dir not found at ${extracted}. Run extraction first.`);
  }
  const tree = walkDir(extracted, PUBLIC_FILES);
  fs.writeFileSync(OUT_FILE_TREE, JSON.stringify(tree, null, 2));
  console.log(`   ✓ ${tree.length} entries written to src/data/file-tree.json`);
  return tree;
}

// ── Step 3: Parse answer key → problems.json ──────────────────────────────────

const PROBLEM_ID_MAP = {
  'No Folder Structure': 'no-folder-structure',
  'Bad File Naming': 'file-naming',
  'No Versioning System': 'versioning',
  'Proprietary and Inappropriate File Formats': 'file-formats',
  'No Documentation (No README)': 'no-readme',
  'No Metadata': 'no-metadata',
  'Raw and Processed Data Are Mixed Together': 'raw-processed-mixed',
  'Data Quality Issues Inside the Files': 'data-quality',
  'Code Has No Comments and Is Not Reproducible': 'code-quality',
  'No License': 'no-license',
  'No Data Availability Statement': 'no-data-availability',
  'No Persistent Identifier (DOI)': 'no-doi',
  'No Backup Strategy': 'no-backup',
};

// Friendly short names shown on the checklist
const CHECKLIST_NAMES = {
  'no-folder-structure': 'Folder structure',
  'file-naming': 'File naming',
  'versioning': 'Versioning',
  'file-formats': 'File formats',
  'no-readme': 'README / documentation',
  'no-metadata': 'Metadata',
  'raw-processed-mixed': 'Raw vs. processed data',
  'data-quality': 'Data quality (inside files)',
  'code-quality': 'Code quality',
  'no-license': 'Licensing',
  'no-data-availability': 'Data availability statement',
  'no-doi': 'Persistent identifiers',
  'no-backup': 'Backup strategy',
};

function parseResources(text) {
  const resources = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.startsWith('-'));
  for (const line of lines) {
    const stripped = line.replace(/^-\s*/, '');
    // Markdown link: [Title](URL)
    const mdLink = stripped.match(/^\[(.+?)\]\((https?:\/\/[^\s)]+)\)/);
    if (mdLink) {
      resources.push({ title: mdLink[1], url: mdLink[2] });
      continue;
    }
    // Title: URL (colon then space then http)
    const colonLink = stripped.match(/^(.+?):\s+(https?:\/\/\S+)$/);
    if (colonLink) {
      resources.push({ title: colonLink[1].trim(), url: colonLink[2].trim() });
      continue;
    }
    // Plain URL
    const urlOnly = stripped.match(/^(https?:\/\/\S+)$/);
    if (urlOnly) {
      resources.push({ title: urlOnly[1], url: urlOnly[1] });
    }
  }
  return resources;
}

function extractSection(text, label, nextLabels) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Build lookahead alternatives.
  // DO NOT use the 'm' flag here — with 'm', bare '$' in the lookahead matches
  // end-of-line, causing the non-greedy [\s\S]*? to stop at the first newline.
  const lookaheadParts = nextLabels.map(l => {
    const esc = l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return `\\*\\*${esc}:\\*\\*`;
  });
  // Section separator "---" on its own line
  lookaheadParts.push('\\n---(?:\\n|$)');
  const lookahead = lookaheadParts.join('|');

  const pattern = new RegExp(
    `\\*\\*${escapedLabel}:\\*\\*([\\s\\S]*?)(?=${lookahead}|$)`,
    // No flags — '$' matches end of string, not end of line
  );
  const m = text.match(pattern);
  return m ? m[1].trim() : '';
}

function parseAnswerKey() {
  console.log('📖 Parsing answer key…');
  const content = fs.readFileSync(ANSWER_KEY, 'utf8');

  // Split on problem headers: "## Problem N: Title"
  const blocks = content.split(/^## Problem \d+:/m).slice(1);

  if (blocks.length === 0) {
    throw new Error('No problem blocks found in answer key — check file format.');
  }

  const problems = blocks.map(block => {
    const firstLine = block.split('\n')[0].trim();
    // firstLine is " No Folder Structure" (with leading space from split)
    const title = firstLine.replace(/^\s*/, '');
    const id = PROBLEM_ID_MAP[title];
    if (!id) {
      console.warn(`   ⚠ Unknown problem title: "${title}" — using slugified fallback`);
    }
    const resolvedId = id ?? title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const what = extractSection(block, "What's wrong", ["Why it matters", "How to fix it", "Resources"]);
    const why = extractSection(block, "Why it matters", ["How to fix it", "Resources"]);
    const fix = extractSection(block, "How to fix it", ["Resources"]);
    const resourcesSection = extractSection(block, "Resources", []);
    const resources = parseResources(resourcesSection);

    if (!what) console.warn(`   ⚠ Empty "what" for problem: ${title}`);
    if (!why) console.warn(`   ⚠ Empty "why" for problem: ${title}`);

    return {
      id: resolvedId,
      name: CHECKLIST_NAMES[resolvedId] ?? title,
      fullTitle: title,
      what,
      why,
      fix,
      resources,
    };
  });

  // Merge sub-problems from sub-problems.json if present
  const subProblemsFile = path.join(SRC_DATA, 'sub-problems.json');
  if (fs.existsSync(subProblemsFile)) {
    const subMap = JSON.parse(fs.readFileSync(subProblemsFile, 'utf8'));
    for (const p of problems) {
      if (subMap[p.id]) {
        p.subProblems = subMap[p.id];
        console.log(`   ✓ merged ${p.subProblems.length} sub-problems into ${p.id}`);
      }
    }
  }

  fs.writeFileSync(OUT_PROBLEMS, JSON.stringify(problems, null, 2));
  console.log(`   ✓ ${problems.length} problems written to src/data/problems.json`);
  return problems;
}

// ── Step 4: Generate mapping.json proposal ─────────────────────────────────────

function generateMapping(fileTree) {
  console.log('🗺  Generating mapping.json proposal…');

  // Only the files (not the folder entry)
  const files = fileTree.filter(e => e.type === 'file').map(e => e.name);

  const log = [];

  function triggerFile(path, reason) {
    log.push(`  file trigger: "${path}" → ${reason}`);
    return { type: 'file', path };
  }

  // Classify each file. Assign each file to EXACTLY ONE problem to avoid
  // right-click conflicts. Priority order matches the order problems appear
  // in the answer key.

  const noFolderStructureTriggers = [
    // Right-clicking empty space in the project folder window or desktop
    { type: 'desktop' },
  ];
  log.push('  desktop trigger → no-folder-structure (absence of any subfolder)');

  const fileNamingTriggers = [];
  const versioningTriggers = [];
  const fileFormatTriggers = [];
  const rawProcessedTriggers = [];
  const codeQualityTriggers = [];
  const noBackupTriggers = [];
  const noDataAvailabilityTriggers = [];

  for (const f of files) {
    const lower = f.toLowerCase();
    const ext = path.extname(f).toLowerCase();

    // Browser-dupe patterns like "(1)" → no-backup (suggests no systematic storage)
    if (/\(\d+\)/.test(f)) {
      noBackupTriggers.push(triggerFile(f, 'browser download duplicate → no-backup'));
      continue;
    }

    // "results_final.xlsx" → raw-processed-mixed (processed output alongside raw)
    if (f === 'results_final.xlsx') {
      rawProcessedTriggers.push(triggerFile(f, 'processed result sitting with raw files → raw-processed-mixed'));
      continue;
    }

    // Manuscript → no-data-availability (only the primary submission, not all drafts)
    if (f === 'MANUSCRIPT FINAL SUBMISSION.docx') {
      noDataAvailabilityTriggers.push(triggerFile(f, 'manuscript without data availability statement → no-data-availability'));
      continue;
    }
    // Other manuscript drafts → file-naming (fall through to naming check below)

    // soil_samples_preview.csv is only triggered via cell-level targets (ambiguous
    // headers, mixed NA codes) — no file-level trigger assigned to avoid confusion.
    if (f === 'soil_samples_preview.csv') {
      log.push(`  (soil_samples_preview.csv: cell triggers only — skipping file-level assignment)`);
      continue;
    }

    // Proprietary format violations → file-formats
    // Prioritize clearly lossy/proprietary files
    if (['.dat'].includes(ext)) {
      fileFormatTriggers.push(triggerFile(f, 'proprietary .dat format → file-formats'));
      continue;
    }
    if (['.jpg', '.jpeg'].includes(ext)) {
      fileFormatTriggers.push(triggerFile(f, 'lossy JPEG for scientific image → file-formats'));
      continue;
    }
    if (f === 'analysis_results_USE THIS ONE.docx') {
      fileFormatTriggers.push(triggerFile(f, 'data stored in Word doc → file-formats'));
      continue;
    }

    // Python scripts → code-quality
    if (ext === '.py') {
      if (/old/i.test(f)) {
        versioningTriggers.push(triggerFile(f, '"old" in name → versioning'));
      } else {
        codeQualityTriggers.push(triggerFile(f, 'Python script → code-quality'));
      }
      continue;
    }

    // Versioning violations (FINAL, v2, "really", JK comments) — before file-naming
    if (/FINAL/i.test(f) || /v2/i.test(f) || /really/i.test(f) || /comments/i.test(f)) {
      versioningTriggers.push(triggerFile(f, 'ad-hoc versioning in filename → versioning'));
      continue;
    }

    // File naming violations (spaces, COPY, generic, no date)
    const hasSpace = /\s/.test(f);
    const hasCopy = /COPY/i.test(f);
    const isGeneric = /^(data_new|cleaned data|soil samples|notes|Figure)/i.test(f);
    const noDate = !/^\d{8}/.test(f);

    if (hasSpace || hasCopy || isGeneric || noDate) {
      fileNamingTriggers.push(
        triggerFile(f, `file-naming: spaces=${hasSpace}, copy=${hasCopy}, generic=${isGeneric}`),
      );
      continue;
    }

    log.push(`  (no trigger assigned for: "${f}")`);
  }

  // Cell triggers for soil_samples_preview.csv
  // Row indices are 0-based counting from the top of the raw CSV.
  // Row 0: title metadata → data-quality
  // Row 2: header with "col1" etc → no-metadata
  // Row 6: "n/a" missing code → data-quality
  // Row 9: "-999" missing code → data-quality
  // Row 11: "??" missing code → data-quality
  const noMetadataTriggers = [
    { type: 'cell', path: 'soil_samples_preview.csv', row: 2, col: 1 }, // col1
    { type: 'cell', path: 'soil_samples_preview.csv', row: 2, col: 2 }, // col2
    { type: 'cell', path: 'soil_samples_preview.csv', row: 2, col: 3 }, // col3
    { type: 'cell', path: 'soil_samples_preview.csv', row: 2, col: 5 }, // temp (no units)
  ];
  log.push('  cell triggers row 2 cols 1-3,5 → no-metadata (ambiguous headers)');

  const dataQualityTriggers = [
    { type: 'cell', path: 'soil_samples_preview.csv', row: 0, col: 0 }, // survey title in data
    { type: 'cell', path: 'soil_samples_preview.csv', row: 6, col: 4 }, // "n/a" pH
    { type: 'cell', path: 'soil_samples_preview.csv', row: 9, col: 4 }, // "-999" pH
    { type: 'cell', path: 'soil_samples_preview.csv', row: 11, col: 4 }, // "??" pH
  ];
  log.push('  cell triggers rows 0,6,9,11 → data-quality (title in data, inconsistent NA codes)');

  // Line triggers for script.py
  codeQualityTriggers.push(
    { type: 'line', path: 'script.py', line: 7 }, // # TODO: fix this later
    { type: 'line', path: 'script.py', line: 8 }, // # print(...) commented debug
  );
  log.push('  line triggers lines 7-8 in script.py → code-quality');

  const mapping = {
    problems: [
      { id: 'no-folder-structure', triggers: noFolderStructureTriggers, matchRule: 'any' },
      { id: 'file-naming', triggers: fileNamingTriggers, matchRule: 'any' },
      { id: 'versioning', triggers: versioningTriggers, matchRule: 'any' },
      { id: 'file-formats', triggers: fileFormatTriggers, matchRule: 'any' },
      { id: 'no-readme', triggers: [{ type: 'project-absence', name: 'README' }], matchRule: 'any' },
      { id: 'no-metadata', triggers: noMetadataTriggers, matchRule: 'any' },
      { id: 'raw-processed-mixed', triggers: rawProcessedTriggers, matchRule: 'any' },
      { id: 'data-quality', triggers: dataQualityTriggers, matchRule: 'any' },
      { id: 'code-quality', triggers: codeQualityTriggers, matchRule: 'any' },
      { id: 'no-license', triggers: [{ type: 'project-absence', name: 'LICENSE' }], matchRule: 'any' },
      { id: 'no-data-availability', triggers: noDataAvailabilityTriggers, matchRule: 'any' },
      { id: 'no-doi', triggers: [{ type: 'project-absence', name: 'DOI' }], matchRule: 'any' },
      { id: 'no-backup', triggers: noBackupTriggers, matchRule: 'any' },
    ],
  };

  // Always write the proposal (for reference after hand-editing)
  fs.writeFileSync(OUT_MAPPING_PROPOSAL, JSON.stringify(mapping, null, 2));
  log.forEach(l => console.log(l));
  console.log('   ✓ Proposal written to src/data/mapping.proposal.json');

  // Only create mapping.json if it doesn't exist (protect hand edits)
  if (!fs.existsSync(OUT_MAPPING)) {
    fs.writeFileSync(OUT_MAPPING, JSON.stringify(mapping, null, 2));
    console.log('   ✓ mapping.json created (hand-edit this file to refine triggers)');
  } else {
    console.log('   ℹ mapping.json already exists — not overwritten (compare with mapping.proposal.json)');
  }
}

// ── Step 5: Copy icons + build manifest ───────────────────────────────────────

function copyIcons() {
  console.log('🎨 Copying icons…');
  fs.mkdirSync(PUBLIC_ICONS, { recursive: true });

  const svgDir = path.join(RDM_ICONS_DIR, 'svg');
  if (!fs.existsSync(svgDir)) {
    console.warn(`   ⚠ SVG dir not found at ${svgDir} — skipping icon copy`);
    return;
  }

  const icons = [];
  for (const file of fs.readdirSync(svgDir)) {
    if (!file.endsWith('.svg')) continue;
    fs.copyFileSync(path.join(svgDir, file), path.join(PUBLIC_ICONS, file));
    icons.push({ name: path.basename(file, '.svg'), file });
  }

  fs.writeFileSync(OUT_ICON_MANIFEST, JSON.stringify({ icons }, null, 2));
  console.log(`   ✓ ${icons.length} icons + manifest written to public/icons/`);
}

// ── Step 6: Generate downloadable HTML guide ─────────────────────────────────

function generateGuideHtml() {
  console.log('📄 Generating downloadable RDM Guide…');
  fs.mkdirSync(PUBLIC_DOWNLOADS, { recursive: true });

  const md = fs.readFileSync(ANSWER_KEY, 'utf8');

  // Minimal synchronous markdown → HTML (avoid importing ESM marked here)
  // We'll do a lightweight transform; full rendering uses marked in the browser.
  function minimalMdToHtml(text) {
    return text
      .split('\n\n')
      .map(para => {
        para = para.trim();
        if (!para) return '';
        // Code block
        if (para.startsWith('```')) {
          const code = para.replace(/^```[^\n]*\n?/, '').replace(/\n?```$/, '');
          return `<pre><code>${esc(code)}</code></pre>`;
        }
        // Headings
        if (para.startsWith('# ')) return `<h1>${esc(para.slice(2))}</h1>`;
        if (para.startsWith('## ')) return `<h2>${esc(para.slice(3))}</h2>`;
        if (para.startsWith('### ')) return `<h3>${esc(para.slice(4))}</h3>`;
        // Bullet list
        if (para.startsWith('- ') || para.startsWith('| ')) {
          const lines = para.split('\n');
          if (lines[0].startsWith('| ')) {
            // Table
            const rows = lines.filter(l => !l.startsWith('|---'));
            const html = rows.map((row, i) => {
              const cells = row.split('|').slice(1, -1).map(c => c.trim());
              const tag = i === 0 ? 'th' : 'td';
              return `<tr>${cells.map(c => `<${tag}>${inlineHtml(c)}</${tag}>`).join('')}</tr>`;
            }).join('');
            return `<table border="1">${html}</table>`;
          }
          const items = lines.map(l => `<li>${inlineHtml(l.replace(/^-\s*/, ''))}</li>`).join('');
          return `<ul>${items}</ul>`;
        }
        return `<p>${inlineHtml(para)}</p>`;
      })
      .join('\n');
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function inlineHtml(s) {
    return s
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>');
  }

  const body = minimalMdToHtml(md);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>RDM Problems and Fixes Guide</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #111; }
  h1 { font-family: 'Press Start 2P', monospace; font-size: 1.1rem; border-bottom: 3px solid black; padding-bottom: 8px; }
  h2 { font-family: 'Press Start 2P', monospace; font-size: 0.85rem; margin-top: 2.5rem; border-left: 4px solid black; padding-left: 12px; }
  h3 { font-family: 'Press Start 2P', monospace; font-size: 0.7rem; }
  pre { background: #f5f5f5; border: 1px solid #ccc; padding: 12px; overflow-x: auto; font-size: 0.85em; }
  code { background: #f0f0f0; padding: 1px 4px; font-size: 0.9em; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.9em; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #eee; }
  a { color: #0000cc; }
  @media print { a[href]:after { content: " (" attr(href) ")"; font-size: 0.8em; } }
</style>
</head>
<body>
${body}
<footer style="margin-top:3rem;padding-top:1rem;border-top:1px solid #ccc;font-size:0.75em;color:#666;">
  Generated by the RDM Scavenger Hunt — Lib4RI Basics of Research Data Management workshop.
</footer>
</body>
</html>`;

  fs.writeFileSync(OUT_GUIDE_HTML, html);
  console.log('   ✓ Guide written to public/downloads/RDM_Guide.html');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔧 RDM Scavenger Hunt — build-content\n');

  // Validate source files
  for (const [label, p] of [['Tarball', TARBALL], ['Answer key', ANSWER_KEY], ['Icons dir', RDM_ICONS_DIR]]) {
    if (!fs.existsSync(p)) {
      throw new Error(`${label} not found at: ${p}\nSet env vars RDM_SOURCE_REPO / RDM_ICONS_DIR to override.`);
    }
  }

  await extractTarball();
  await postProcessFiles();
  const tree = buildFileTree();
  parseAnswerKey();
  generateMapping(tree);
  copyIcons();
  generateGuideHtml();

  console.log('\n✅ build-content done\n');
}

main().catch(err => {
  console.error('❌ build-content failed:', err.message);
  process.exit(1);
});
