
## Topic 1 — Bad File Naming

**What's wrong**

The manuscript files violate good naming practices:

| File | Problems |
|------|----------|
| `manuscript draft.docx` | Spaces in filename, no date, no version number |
| `manuscript_draft_v2_JK comments.docx` | Person's name embedded instead of a version number |

**Why it matters**

Bad file names make it impossible to sort, search, or identify files without opening them. They cause errors in scripts (spaces break command-line tools), create confusion about which version is current, and are meaningless to anyone outside the project.

**How to fix it**

Adopt the convention: `Date_ProjectName_DocumentType_Version.extension`

| Original | Fixed |
|----------|-------|
| `manuscript draft.docx` | `20260501_AlpineSoil_Manuscript_v0.1.docx` |
| `manuscript_draft_v2_JK comments.docx` | `20260501_AlpineSoil_Manuscript_v0.2.docx` |

Rules: no spaces (use underscores), no special characters, date in YYYYMMDD format, descriptive project name, document type, semantic version number.

**Resources**

- Bulk Rename Utility (Windows): https://www.bulkrenameutility.co.uk/
- Renamer 6 (Mac): https://renamer.com/
- Jenny Bryan's naming convention guide: https://speakerdeck.com/jennybc/how-to-name-files


## Topic 2 — No Versioning System

**What's wrong**

The project uses ad-hoc "versioning" through filename suffixes like `v2`, `JK comments`. There is no version control for code or data. There is no way to know what changed between versions, when, or why.

**Why it matters**

Without proper versioning, you can't trace the history of changes, you can't undo mistakes, you can't tell which version of the code produced which results, and you risk accidentally working on or sharing the wrong version.

**How to fix it**

For **code**: Use Git. Initialize a repository, commit changes with descriptive messages, and use branches for experimental work. Host on GitHub, GitLab, Codeberg, or an institutional Gitea/Forgejo server.

For **data**: Use semantic version numbers in filenames (v1.0, v1.1, v2.0) and maintain a changelog — either in the README or a separate CHANGELOG file — that records what changed in each version.

**Resources**

- Git: https://git-scm.com/
- Git GUIs: https://git-scm.com/downloads/guis
- Software Carpentry Git lesson: https://swcarpentry.github.io/git-novice/



## Topic 3 — Proprietary and Inappropriate File Formats

**What's wrong**

The project uses JPEG images for figures and microscopy:

| File | Format Problem |
|------|---------------|
| `fig1_updated.jpg` | JPEG is lossy — every save degrades quality. Figures for publication should be in lossless formats. |
| `microscopy_sample_12.jpg` | JPEG is lossy — microscopy images should be in a lossless format to preserve fine detail. |

**Why it matters**

Lossy formats permanently destroy information with every save. This violates the "interoperable" FAIR principle and can compromise the scientific integrity of images used in publications.

**How to fix it**

| Data type | Current format | Recommended format |
|-----------|---------------|-------------------|
| Microscopy images | .jpg | .tiff (uncompressed) |
| Figures for publication | .jpg | .png or .tiff |

Keep the original if needed for your workflow, but always save an additional copy in a lossless format for archiving and sharing.

**Resources**

- Library of Congress Recommended Formats: https://www.loc.gov/preservation/resources/rfs/
- UK Data Service file format guidance: https://ukdataservice.ac.uk/learning-hub/research-data-management/format-your-data/recommended-formats/


## Topic 4 — No Documentation (No README)

**What's wrong**

There is no README file anywhere in the project. Without it, there is no way to understand what the project is about, what the files contain, how the data was collected, what processing was applied, or how to reproduce the results.

**Why it matters**

Without a README, no one — including the researchers themselves after a few months — can understand or reuse the project. This violates the "reusable" FAIR principle.

**How to fix it**

Create a README.md at the root of the project. A good README should include:

1. **General information**: Project title, principal investigator, contact info, dates of data collection, geographic location, funding sources.
2. **Data and file overview**: A list of all files with brief descriptions, relationships between files.
3. **Methodological information**: How data was collected (instruments, protocols), any quality control applied, known issues.
4. **Data-specific information**: Variable names with descriptions and units, missing data codes.
5. **Sharing and access information**: License, restrictions, how to cite.

**Resources**

- Cornell README template: https://cornell.app.box.com/v/ReadmeTemplate
- makeareadme.com: https://www.makeareadme.com/


## Topic 5 — Raw Data Not Preserved / Data Provenance

**What's wrong**

`raw_alpine_soil_data.xlsx` — the original, unprocessed data file — was found in the Trash. Raw data is the irreplaceable foundation of a research project. Once deleted or overwritten, it cannot be recreated.

**Why it matters**

Raw data is the ground truth of your research. If something goes wrong downstream — a processing error, a bug in your script, a question from a reviewer — you must be able to go back to the original. Deleting or modifying raw data permanently destroys that ability and violates good scientific practice.

**How to fix it**

Follow these raw-data rules:

1. **Never delete raw data.** Archive it in a read-only location.
2. **Never edit raw data directly.** All cleaning and processing must happen in a separate script that reads the raw file and writes a new processed file.
3. **Store raw data in at least two places** (e.g., your local drive AND your institute's storage or a repository).
4. **Make raw files read-only** (`chmod 444` on Linux/Mac, or lock the file in your OS) so they can't be accidentally modified.

A clean project layout separates concerns:
```
data/
  raw/          ← original files, never touched
  processed/    ← output of your scripts
```

**Resources**

- UKRN Primer: Research Data Management: https://www.ukrn.org/primers/
- DataONE Best Practice: Preserve information rich data: https://dataoneorg.github.io/Education/bestpractices/preserve-information-keep


## Topic 6 — Data Quality Issues Inside the Files

This is the game's "Boss Battle": the player must find all 8 individual data-quality issues inside `soil samples.xlsx`. The parent overview text is shown first, followed by the eight sub-problems. (parent overview)

**What's wrong**

Looking at `soil samples.xlsx`, the data has multiple internal problems:

| Issue | Example |
|-------|---------|
| Floating title row | Row 0: survey title embedded in data — breaks automated parsing |
| Embedded note | Row 1: free-text note in a data cell |
| Ambiguous column names | `col1`, `col2`, `col3` — meaningless without documentation |
| Inconsistent missing data codes | Blank cells, `NA`, `n/a`, `-999`, `??` — five different representations of "missing" |

**Why it matters**

These issues cause scripts to break, statistics to be wrong (e.g., `-999` would distort a mean if not excluded), and other researchers to misinterpret the data.

**How to fix it**

1. **Remove non-data rows** from the data file. Put titles and notes in the README instead.
2. **Use descriptive column headers** with units: `soil_moisture_pct`, `air_temperature_degC`.
3. **Standardize missing data** to a single code (blank or `NA`) and document what it means in the README.
4. **Follow tidy data principles**: each variable in a column, each observation in a row, each value in a cell.

**Resources**

- Broman & Woo (2018), "Data Organization in Spreadsheets" (The American Statistician): https://doi.org/10.1080/00031305.2017.1375989
- Tidy Data (Hadley Wickham): https://vita.had.co.nz/papers/tidy-data.html

---

#### Sub-problem 6.1 — Floating title row

**What's wrong**

Row 0 of `soil samples.xlsx` contains **"Alpine Soil Survey - Spring Campaign"** — a survey title embedded inside the data file. This creates a floating header that breaks automated parsing.

**Why it matters**

Scripts expect the first row to be column headers or data. The extra title row shifts all row indices, causing errors in analysis pipelines and breaking tools that auto-detect headers.

**How to fix it**

Remove the title row from the spreadsheet. Store the survey description in a separate README or data dictionary.

```
# Before
Row 0: Alpine Soil Survey - Spring Campaign  ← doesn't belong here
Row 1: (embedded note)
Row 2: id, col1, col2 ...  ← actual header

# After
Row 0: id, col1, col2 ...  ← header is first row
```

**Resources**

- Tidy Data (Hadley Wickham): https://vita.had.co.nz/papers/tidy-data.pdf

#### Sub-problem 6.2 — Embedded note in data

**What's wrong**

Row 1, column F of `soil samples.xlsx` contains the note *"site 7 sensor broken in March"* — a free-text note embedded inside the spreadsheet grid.

**Why it matters**

Notes embedded in cells are invisible to data-loading scripts and are silently dropped when the file is converted or shared. They also prevent the file from being parsed as a clean rectangular table.

**How to fix it**

Remove the note from the cell. Record it in a dedicated **notes** column in the data, or better yet, in the data dictionary or a separate events log.

**Resources**

- DataONE Best Practices: https://www.dataone.org/best-practices/

#### Sub-problem 6.3 — Ambiguous column names

**What's wrong**

Column headers **col1, col2, col3** are meaningless placeholders. **temp** has no units. Without knowing what these columns measure, the data cannot be interpreted.

**Why it matters**

Ambiguous names force every future user to hunt for external context. Analysis errors become more likely, and even the original researcher will forget the meaning within months.

**How to fix it**

Rename columns to meaningful names **with units** where applicable:

| Old name | New name |
|---|---|
| col1 | soil_moisture_pct |
| col2 | organic_carbon_g_per_kg |
| col3 | bulk_density_g_per_cm3 |
| temp | temperature_C |

**Resources**

- Data Organization in Spreadsheets (Broman & Woo): https://doi.org/10.1080/00031305.2017.1375989

#### Sub-problem 6.4 — Missing value: 'NA' string

**What's wrong**

Cell (row 5, col2) of `soil samples.xlsx` contains the string **"NA"** as a missing-value indicator — while other cells use **'n/a'**, **'-999'**, **'??'**, or blank.

**Why it matters**

Using multiple different codes for missing values breaks statistical software. Most tools only recognise one code; mixed codes cause silent errors where some missing values are treated as valid data.

**How to fix it**

Pick **one** consistent missing-value code and document it in the data dictionary. The R/Python convention is `NA` (or `NaN`).

Replace all other codes ('n/a', '-999', '??', blanks) with that single code throughout the file.

**Resources**

- Data Organization in Spreadsheets: https://doi.org/10.1080/00031305.2017.1375989

#### Sub-problem 6.5 — Missing value: 'n/a' string

**What's wrong**

Cell (row 6, pH column) of `soil samples.xlsx` contains **"n/a"** — a second, differently-cased spelling of the not-available indicator used elsewhere as **'NA'**.

**Why it matters**

Case-sensitive languages (Python, R) treat 'NA' and 'n/a' as different values. Mixed spellings mean some missing values appear as valid strings, distorting summary statistics.

**How to fix it**

Standardise all missing values to a single code. Replace every variant ('n/a', 'NA', '-999', '??', blank) with the chosen standard — for example, `NA`.

**Resources**

- Tidy Data: https://vita.had.co.nz/papers/tidy-data.pdf

#### Sub-problem 6.6 — Missing value: blank cell

**What's wrong**

Row 9 of `soil samples.xlsx` has **blank cells** in col1, col2, and col3. These blanks are an implicit missing-value code — it is impossible to tell if they mean 'not collected', 'below detection limit', or a data-entry error.

**Why it matters**

Blank cells are ambiguous. When a file is re-saved, blanks can shift. They also interact unpredictably with pivot tables and summary functions. An explicit code like `NA` is always unambiguous.

**How to fix it**

Replace all blank cells in data rows with the chosen explicit missing-value code (e.g. `NA`). **Never leave cells blank in data columns** — use an explicit code and document it.

**Resources**

- Data Organization in Spreadsheets: https://doi.org/10.1080/00031305.2017.1375989

#### Sub-problem 6.7 — Missing value: -999 sentinel

**What's wrong**

Row 9, pH and temp columns of `soil samples.xlsx` contain **-999** — a numeric sentinel used as a missing-value code. Sentinels that look like plausible numbers are especially dangerous.

**Why it matters**

Statistical functions silently include -999 in averages, min/max, and correlations. A mean pH incorporating -999 is nonsensical, and the error is invisible.

**How to fix it**

Replace -999 (and any other numeric sentinels) with an explicit missing-value code such as `NA`. **Never encode missing data as an extreme number.** Document the convention in the data dictionary.

**Resources**

- Data Organization in Spreadsheets: https://doi.org/10.1080/00031305.2017.1375989

#### Sub-problem 6.8 — Missing value: '??' string

**What's wrong**

Row 11, pH column of `soil samples.xlsx` contains **"??"** — an informal placeholder that does not appear in any documentation.

**Why it matters**

Informal codes like '??' are easy to forget and hard to search for programmatically. They get confused with valid data and cause parse errors in strictly-typed formats.

**How to fix it**

Replace '??' with the standardised missing-value code (e.g. `NA`). Document the decision in the data dictionary so future users know there is exactly one missing-value code.

**Resources**

- Tidy Data: https://vita.had.co.nz/papers/tidy-data.pdf


## Topic 7 — Code Has No Comments

**What's wrong**

`script.py` has no comments explaining what the code does. It uses hardcoded filenames, references ambiguous column names (`col1`, `col3`, `val`), and produces no log or record of what it did.

**Why it matters**

Uncommented code is a black box. No one — including you in six months — will know what it does, why it makes certain choices, or which version produced the published results.

**How to fix it**

1. **Add clear comments** explaining the purpose of each section, the meaning of parameters, and the rationale for decisions.
2. **Use meaningful variable names**: `soil_chemistry_df` not `df`, `temperature_df` not `df2`.
3. **Use relative file paths** or configuration files instead of hardcoded filenames.
4. **Include a requirements file** (`requirements.txt` or `environment.yml`) so others can recreate your environment.

**Resources**

- Software Carpentry Python lesson: https://swcarpentry.github.io/python-novice-inflammation/

## Topic 8 — No License

**What's wrong**

There is no LICENSE file in the project. Without a license, the default legal status in most jurisdictions is "all rights reserved" — meaning no one else can legally use, share, or build upon the data or code.

**Why it matters**

A missing license effectively prevents reuse, which defeats the purpose of sharing data. It violates the "reusable" FAIR principle.

**How to fix it**

For **data**, use a Creative Commons license:
- **CC0** (public domain dedication) — most open, recommended when you want maximum reuse.
- **CC BY 4.0** (attribution required) — most funders recommend this.

For **code**, use an open-source license:
- **MIT** — very permissive, widely used.
- **Apache 2.0** — permissive with patent protection.

Place a `LICENSE.md` file at the root of your project.

**Resources**

- Creative Commons license chooser: https://chooser-beta.creativecommons.org/
- Choose an open source license: https://choosealicense.com/

## Topic 9 — No Folder Structure (RDM Guide Problem 1)

**What's wrong:** All 24 files — raw data, processed data, code, figures, manuscripts, and personal notes — are dumped in a single directory. There is no separation between data stages, no distinction between inputs and outputs, and no logical grouping.

**Why it matters:** Without structure, it's impossible to tell at a glance what stage a file belongs to, whether it's an input or output, or what depends on what. This gets worse as projects grow. A new team member would have no idea where to start.

**How to fix it:** Adopt a consistent folder hierarchy that separates concerns. For example:

```
20260301_AlpineSoilSurvey/
├── protocol/
│   ├── DMP/
│   └── references/
├── data/
│   ├── raw/
│   └── processed/
├── code/
├── results/
│   └── figures/
├── reports/
│   └── manuscripts/
├── README.md
└── LICENSE
```

Key principles: separate raw from processed data, keep code in its own folder, isolate outputs (figures, results) from inputs, and put documentation (README, LICENSE) at the root.

**Resources:**
- The Turing Way — Research Data Management: https://the-turing-way.netlify.app/reproducible-research/rdm
- CESSDA Data Management Guide: https://dmeg.cessda.eu/

## Topic 10 — No Metadata (RDM Guide Problem 6)

**What's wrong:** There is no structured metadata associated with any data file. Column headers in the data are ambiguous (`col1`, `col2`, `col3`, `val`, `temp`) with no descriptions or units. There is no information about the instruments used, measurement protocols, or coordinate reference systems.

**Why it matters:** Metadata is what makes data findable and understandable by both humans and machines. Without it, search engines and data catalogues can't index the data, and other researchers can't assess whether the data is relevant or trustworthy for their needs.

**How to fix it:**

1. **Rename columns** to be self-descriptive: `col1` → `soil_moisture_pct`, `col3` → `organic_carbon_g_per_kg`, `temp` → `air_temperature_degC`.
2. **Standardize missing data codes**: Pick one code (e.g., `NA` or leave blank) and use it consistently — not a mix of `NA`, `n/a`, `-999`, `??`, and blank cells.
3. **Adopt a metadata standard** for your discipline. Use directories like the Digital Curation Centre, RDA Metadata Standards, or FAIRsharing to find the right one.
4. **Use controlled vocabularies** — don't switch between "picture" and "image" or "location" and "site" for the same concept.

**Resources:**
- Digital Curation Centre metadata standards: https://www.dcc.ac.uk/guidance/standards/
- RDA Metadata Standards Catalog: https://rdamsc.bath.ac.uk/
- FAIRsharing: https://fairsharing.org/

## Topic 11 — No Data Availability Statement (RDM Guide Problem 11)

**What's wrong:** The manuscript drafts in this project presumably describe the analysis, but there is no data availability statement — no information about where the data will be deposited, under what DOI, with what license, or how others can access it.

**Why it matters:** Without a data availability statement, readers of the published paper have no way to find or access the underlying data. Many journals now require these statements.

**How to fix it:** Include a statement in the manuscript, for example:

> "The data supporting this study's findings are openly available in EnviDat at https://doi.org/10.xxxx/xxxxx. The dataset includes soil chemistry measurements and temperature/humidity sensor readings from alpine sites in Switzerland (2026) and is available under a CC BY 4.0 license."

This should specify: the repository name, the DOI, what the dataset contains, and the license.

**Resources:**
- Springer Nature data availability statement examples: https://www.springernature.com/gp/authors/research-data-policy/data-availability-statements
- re3data (find a repository): https://www.re3data.org/

## Topic 12 — No Persistent Identifier (DOI) (RDM Guide Problem 12)

**What's wrong:** None of the data has been deposited in a repository, so none of it has a DOI or any other persistent identifier. The data exists only on local machines.

**Why it matters:** Without a persistent identifier, there is no stable, citable reference to the data. Links can break, filenames can change, but a DOI is permanent. This violates the "findable" FAIR principle.

**How to fix it:** Deposit the data in a repository that assigns DOIs. Options relevant to this context include:

- **EnviDat** — the environmental data repository for WSL
- **Zenodo** — a general-purpose repository hosted by CERN (free, accepts any research output)
- **ERIC** — for ETH domain research

Use re3data.org to find discipline-specific repositories if these don't fit.

**Resources:**
- EnviDat: https://www.envidat.ch/
- Zenodo: https://zenodo.org/
- re3data: https://www.re3data.org/
