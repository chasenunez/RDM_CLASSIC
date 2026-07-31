
## Topic 1: Bad File Naming

**What's wrong**

The file `manuscript draft.docx` breaks good naming practice:

| Problem | Why it trips things up |
|------|----------|
| Space in the name (`manuscript draft`) | Many programs and scripts read a space as the end of the name, so the file gets split in two or simply isn't found |
| No date | You can't sort by when it was made, or tell an old copy from a new one |
| No version number | There's no way to see which draft is the latest |

Computers also struggle with special characters. Avoid these in file names: `/ \ : * ? " < > | & % # { } $`. Stick to letters, numbers, hyphens, and underscores.

**Why it matters**

Good names let you (and anyone after you) sort, search, and recognise a file without opening it. Names with spaces or special characters can break command-line tools and scripts, get mangled when files move between Windows, Mac, and Linux, or when they're uploaded to a repository. Vague names like "draft" are meaningless to a colleague, or to you in six months.

**How to fix it**

Adopt the pattern: `YYYYMMDD_ProjectName_DocumentType_Version.extension`

| Original | Fixed |
|----------|-------|
| `manuscript draft.docx` | `20260501_AlpineSoil_Manuscript_v1.0.docx` |

Rules: no spaces (use underscores), no special characters, the date as YYYYMMDD, a descriptive project name, the document type, and a version number.

**Resources**

- Bulk Rename Utility (Windows): https://www.bulkrenameutility.co.uk/
- Renamer 6 (Mac): https://renamer.com/
- Jenny Bryan's naming convention guide: https://speakerdeck.com/jennybc/how-to-name-files


## Topic 2: Ad-hoc File Versioning

**What's wrong**

The file `manuscript_draft_v2_JK comments.docx` shows how *not* to track versions:

| Problem | Why it trips things up |
|------|----------|
| Ad-hoc version tag (`v2`) | `v2` of what? There's no `v1` in sight, and no record of what changed |
| A person's name baked in (`JK comments`) | Names track *who touched it*, not *which version it is*, and they pile up: `_JK_then_AB_final_final` |
| A space in the name | Spaces break scripts and command-line tools |

This is how projects end up with `final`, `final_v2`, and `final_REALLY_final`, and no idea which one is current.

**Why it matters**

Without a real versioning system you can't tell what changed between drafts, when, or why; you can't cleanly undo a mistake; and you risk sharing or building on the wrong copy. Filename tags like `v2` and `JK comments` record none of that.

**How to fix it**

For **documents and data**: use clear, semantic version numbers in the name (v1.0, v1.1, v2.0) and keep a short changelog (in the README or a separate CHANGELOG file) that records what changed in each version.

| Original | Fixed |
|----------|-------|
| `manuscript_draft_v2_JK comments.docx` | `20260501_AlpineSoil_Manuscript_v1.1.docx` |

For **code**: use Git. It records every change, who made it, and why, so you never need `_final_v2` again. Host on GitHub, GitLab, Codeberg, or an institutional Gitea/Forgejo server.

**Resources**

- Git: https://git-scm.com/
- Git GUIs: https://git-scm.com/downloads/guis
- Software Carpentry Git lesson: https://swcarpentry.github.io/git-novice/



## Topic 3: Proprietary and Inappropriate File Formats

**What's wrong**

The project uses proprietary and lossy file formats:

| File | Format Problem |
|------|---------------|
| `fig1.jpg` | JPEG is lossy; every save degrades quality. Figures for publication should be in lossless formats. |
| `microscopy_sample_12.jpg` | JPEG is lossy; microscopy images should be in a lossless format to preserve fine detail. |
| `.xlsx` spreadsheets | Excel's format is proprietary: it needs specific software and can hide formulas, macros, and formatting quirks. |

**Why it matters**

Lossy formats permanently destroy information with every save. Proprietary formats lock your data to one program and may be unreadable in the future. Both violate the "interoperable" FAIR principle and can compromise the scientific integrity of the work.

**How to fix it**

Images:

| Data type | Current format | Recommended format |
|-----------|---------------|-------------------|
| Microscopy images | .jpg | .tiff (uncompressed) |
| Figures for publication | .jpg | .png or .tiff |

Spreadsheets: for sharing and long-term reuse, also export tabular data as **CSV** (comma-separated values). CSV is plain text, so any tool can open it and it will still be readable decades from now, no Excel required. Researchers naturally reach for Excel because it matches day-to-day reality, but the archived, shareable copy should be an open format like CSV.

Keep the original if your workflow needs it, but always save an additional copy in an open, non-proprietary format for archiving and sharing. (Figures can keep short descriptive names like `fig1.png`: the naming rules just mean no spaces or special characters, and a lossless format.)

**Resources**

- Library of Congress Recommended Formats: https://www.loc.gov/preservation/resources/rfs/
- UK Data Service file format guidance: https://ukdataservice.ac.uk/learning-hub/research-data-management/format-your-data/recommended-formats/


## Topic 4: No Documentation (No README)

**What's wrong**

There is no README file anywhere in the project. Without it, there is no way to understand what the project is about, what the files contain, how the data was collected, what processing was applied, or how to reproduce the results.

**Why it matters**

Without a README, no one (including the researchers themselves after a few months) can understand or reuse the project. This violates the "reusable" FAIR principle.

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


## Topic 5: Raw Data Not Preserved / Data Provenance

**What's wrong**

`raw_alpine_soil_data.xlsx` (the original, unprocessed data file) was found in the Trash. Raw data is the irreplaceable foundation of a research project. Once deleted or overwritten, it cannot be recreated.

**Why it matters**

Raw data is the ground truth of your research. If something goes wrong downstream (a processing error, a bug in your script, a question from a reviewer) you must be able to go back to the original. Deleting or modifying raw data permanently destroys that ability and violates good scientific practice.

**How to fix it**

Follow these raw-data rules:

1. **Never delete raw data.** Archive it in a read-only location.
2. **Never edit raw data directly.** All cleaning and processing must happen in a separate script that reads the raw file and writes a new processed file.
3. **Follow the 3-2-1 rule**: keep at least **3** copies of your data, on **2** different types of media (for example your computer and an institutional server), with **1** copy kept off-site (a repository or cloud backup). Two copies on the same laptop is not a backup.
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


## Topic 6: Data Quality Issues Inside the Files

This is the game's "Boss Battle": the player must find all 9 individual data-quality issues inside `soil samples.xlsx`. The parent overview text is shown first, followed by the nine sub-problems.

**What's wrong**

Looking at `soil samples.xlsx`, the data has multiple internal problems:

| Issue | Example |
|-------|---------|
| Floating title row | Row 0: survey title embedded in data, which breaks automated parsing |
| Embedded note | Row 1: free-text note in a data cell |
| Ambiguous column names | `col1`, `col2`, `col3`: meaningless without documentation |
| Inconsistent missing data codes | Blank cells, `NA`, `n/a`, `-999`, `??`: five different representations of "missing" |
| Mixed data types / decimal formats | `42,1` stored as text (comma decimal) where the column is otherwise numbers |

**Why it matters**

These issues cause scripts to break, statistics to be wrong (e.g., `-999` would distort a mean if not excluded), and other researchers to misinterpret the data.

**How to fix it**

1. **Remove non-data rows** from the data file. Put titles and notes in the README instead.
2. **Use descriptive column headers** with units: `soil_moisture_pct`, `air_temperature_degC`.
3. **Use one explicit missing-value code** (the R/Python convention is `NA`) and document it in the README. Don't leave cells blank: a blank is ambiguous (not collected? below detection? forgotten?), while `NA` is unmistakable.
4. **Keep types and formats consistent**: numbers stored as numbers, one decimal separator (the dot `.`), no stray text in numeric columns.
5. **Follow tidy data principles**: each variable in a column, each observation in a row, each value in a cell.

**Resources**

- Broman & Woo (2018), "Data Organization in Spreadsheets" (The American Statistician): https://doi.org/10.1080/00031305.2017.1375989
- Tidy Data (Hadley Wickham): https://vita.had.co.nz/papers/tidy-data.html

---

#### Sub-problem 6.1: Floating title row

**What's wrong**

Row 0 of `soil samples.xlsx` contains **"Alpine Soil Survey - Spring Campaign"**, a survey title embedded inside the data file. This creates a floating header that breaks automated parsing.

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

#### Sub-problem 6.2: Embedded note in data

**What's wrong**

Row 1, column F of `soil samples.xlsx` contains the note *"site 7 sensor broken in March"*, a free-text note embedded inside the spreadsheet grid.

**Why it matters**

Notes embedded in cells are invisible to data-loading scripts and are silently dropped when the file is converted or shared. They also prevent the file from being parsed as a clean rectangular table.

**How to fix it**

Remove the note from the cell. Record it in a dedicated **notes** column in the data, or better yet, in the data dictionary or a separate events log.

**Resources**

- DataONE Best Practices: https://www.dataone.org/best-practices/

#### Sub-problem 6.3: Ambiguous column names

**What's wrong**

Column headers **col1, col2, col3** are meaningless placeholders. **temp** has no units. Without knowing what these columns measure, the data cannot be interpreted.

**Why it matters**

Ambiguous names force every future user to hunt for external context. Analysis errors become more likely, and even the original researcher will forget the meaning within months.

**How to fix it**

Rename columns to meaningful names **with units** where applicable:

| Old name | New name |
|---|---|
| id | site_id |
| col1 | soil_moisture_pct |
| col2 | organic_carbon_g_per_kg |
| col3 | bulk_density_g_per_cm3 |
| temp | air_temperature_degC |

**Resources**

- Data Organization in Spreadsheets (Broman & Woo): https://doi.org/10.1080/00031305.2017.1375989

#### Sub-problem 6.4: Missing value: 'NA' string

**What's wrong**

Cell (row 5, col2) of `soil samples.xlsx` contains the string **"NA"** as a missing-value indicator, while other cells use **'n/a'**, **'-999'**, **'??'**, or blank.

**Why it matters**

Using multiple different codes for missing values breaks statistical software. Most tools only recognise one code; mixed codes cause silent errors where some missing values are treated as valid data.

**How to fix it**

Pick **one** consistent missing-value code and document it in the data dictionary. The R/Python convention is `NA` (or `NaN`).

Replace all other codes ('n/a', '-999', '??', blanks) with that single code throughout the file.

**Resources**

- Data Organization in Spreadsheets: https://doi.org/10.1080/00031305.2017.1375989

#### Sub-problem 6.5: Missing value: 'n/a' string

**What's wrong**

Cell (row 6, pH column) of `soil samples.xlsx` contains **"n/a"**, a second, differently-cased spelling of the not-available indicator used elsewhere as **'NA'**.

**Why it matters**

Case-sensitive languages (Python, R) treat 'NA' and 'n/a' as different values. Mixed spellings mean some missing values appear as valid strings, distorting summary statistics.

**How to fix it**

Standardise all missing values to a single code. Replace every variant ('n/a', 'NA', '-999', '??', blank) with the chosen standard, for example `NA`.

**Resources**

- Tidy Data: https://vita.had.co.nz/papers/tidy-data.pdf

#### Sub-problem 6.6: Missing value: blank cell

**What's wrong**

`soil samples.xlsx` has **blank cells** in its measurement columns: all of col1, col2, and col3 on row 9, and the temp reading on row 5. Blanks in the free-text `notes` column are fine; an empty note is not a missing measurement. These blanks are an implicit missing-value code; it is impossible to tell if they mean 'not collected', 'below detection limit', or a data-entry error.

**Why it matters**

Blank cells are ambiguous. When a file is re-saved, blanks can shift. They also interact unpredictably with pivot tables and summary functions. An explicit code like `NA` is always unambiguous.

**How to fix it**

Replace all blank cells in data rows with the chosen explicit missing-value code (e.g. `NA`). **Never leave cells blank in data columns**: use an explicit code and document it.

**Resources**

- Data Organization in Spreadsheets: https://doi.org/10.1080/00031305.2017.1375989

#### Sub-problem 6.7: Missing value: -999 sentinel

**What's wrong**

Row 9, pH and temp columns of `soil samples.xlsx` contain **-999**, a numeric sentinel used as a missing-value code. Sentinels that look like plausible numbers are especially dangerous.

**Why it matters**

Statistical functions silently include -999 in averages, min/max, and correlations. A mean pH incorporating -999 is nonsensical, and the error is invisible.

**How to fix it**

Replace -999 (and any other numeric sentinels) with an explicit missing-value code such as `NA`. **Never encode missing data as an extreme number.** Document the convention in the data dictionary.

**Resources**

- Data Organization in Spreadsheets: https://doi.org/10.1080/00031305.2017.1375989

#### Sub-problem 6.8: Missing value: '??' string

**What's wrong**

Row 11, pH column of `soil samples.xlsx` contains **"??"**, an informal placeholder that does not appear in any documentation.

**Why it matters**

Informal codes like '??' are easy to forget and hard to search for programmatically. They get confused with valid data and cause parse errors in strictly-typed formats.

**How to fix it**

Replace '??' with the standardised missing-value code (e.g. `NA`). Document the decision in the data dictionary so future users know there is exactly one missing-value code.

**Resources**

- Tidy Data: https://vita.had.co.nz/papers/tidy-data.pdf

#### Sub-problem 6.9: Mixed type / decimal format

**What's wrong**

Cell (row 4, col2) of `soil samples.xlsx` holds **"42,1"**, a number written with a comma decimal separator and stored as text, while the rest of that column are ordinary numbers written with a dot (e.g. `45.6`).

**Why it matters**

Mixing decimal separators (`,` vs `.`) and storing a number as text makes analysis tools misread the value; they may drop it, treat it as zero, or refuse to compute statistics for the whole column. The error is silent, so it slips into results unnoticed.

**How to fix it**

Use one decimal separator throughout (the dot `.` is the safest for software) and store numbers as numbers, not text. Fix `42,1` to `42.1`. If the data was entered in a locale that uses the comma, convert it on import and document the convention in the data dictionary.

**Resources**

- Data Organization in Spreadsheets: https://doi.org/10.1080/00031305.2017.1375989


## Topic 7: Code Has No Comments

**What's wrong**

`script.py` has no comments explaining what the code does. It uses hardcoded filenames, references ambiguous column names (`col1`, `col3`, `val`), and produces no log or record of what it did.

(The file name `script.py` itself is fine: short, no spaces, correct extension. The problem here is what's *inside* the file, not what it's called.)

**Why it matters**

Uncommented code is a black box. No one (including you in six months) will know what it does, why it makes certain choices, or which version produced the published results.

**How to fix it**

1. **Add clear comments** explaining the purpose of each section, the meaning of parameters, and the rationale for decisions.
2. **Use meaningful variable names**: `soil_chemistry_df` not `df`, `temperature_df` not `df2`.
3. **Use relative file paths** or configuration files instead of hardcoded filenames.
4. **Include a requirements file** (`requirements.txt` or `environment.yml`) so others can recreate your environment.

**Resources**

- Software Carpentry Python lesson: https://swcarpentry.github.io/python-novice-inflammation/

---

## Part 2: Beyond your own computer

Topics 1–7 are about keeping your *own* working copy of a project in good shape: how you name, version, format, document, back up, and organise the files on your machine.

Topics 8–12 shift outward, to what has to be true before your data can leave your computer to be shared, published, and reused by others: a licence that says how it may be used, a structure others can navigate, rich metadata, a data availability statement, and a persistent identifier (DOI). Good local habits make this second step almost free; skipping them makes it painful.

---

## Topic 8: No Licence

**What's wrong**

There is no LICENSE file in the project. Without a licence, the default legal status in most jurisdictions is "all rights reserved", meaning no one else can legally use, share, or build upon the data or code.

**Why it matters**

A missing licence effectively prevents reuse, which defeats the purpose of sharing data. It violates the "reusable" FAIR principle.

**How to fix it**

For **data**, use a Creative Commons licence:
- **CC0** (public domain dedication): most open, recommended when you want maximum reuse.
- **CC BY 4.0** (attribution required): most funders recommend this.

For **code**, use an open-source licence:
- **MIT**: very permissive, widely used.
- **Apache 2.0**: permissive with patent protection.

Place a `LICENSE.md` file at the root of your project.

**Resources**

- Creative Commons license chooser: https://chooser-beta.creativecommons.org/
- Choose an open source license: https://choosealicense.com/

## Topic 9: File/folder organization (RDM Guide Problem 1)

**What's wrong:** The whole project is one flat pile. All the files (raw data, processed data, code, figures, manuscripts, and personal notes) are dumped in a single directory, with no separation between data stages, no distinction between inputs and outputs, and no logical grouping. There is also no version control (no Git repository), so nothing records the history of the project as a whole.

**Why it matters:** Without structure, it's impossible to tell at a glance what stage a file belongs to, whether it's an input or output, or what depends on what. This gets worse as projects grow, and a new team member would have no idea where to start. Without version control, there is no history of how the project reached its current state and no safe way to undo a change across the whole project.

**How to fix it:** Do two things. **First, organise the folder** into a consistent hierarchy that separates concerns. For example:

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

**Second, put the project under version control** with Git so every change to the project as a whole is tracked. Host it on GitHub, GitLab, Codeberg, or an institutional Gitea/Forgejo server. (Git tracks the *project*; the semantic version numbers in Topic 2 track individual *files*. Together they give you a complete history.)

**Resources:**
- The Turing Way, Research Data Management: https://the-turing-way.netlify.app/reproducible-research/rdm
- CESSDA Data Management Guide: https://dmeg.cessda.eu/
- Software Carpentry Git lesson: https://swcarpentry.github.io/git-novice/

## Topic 10: No Metadata (RDM Guide Problem 6)

**What's wrong:** There is no structured metadata associated with any data file. Column headers in the data are ambiguous (`col1`, `col2`, `col3`, `val`, `temp`) with no descriptions or units. There is no information about the instruments used, measurement protocols, or coordinate reference systems.

**Why it matters:** Metadata is what makes data findable and understandable by both humans and machines. Without it, search engines and data catalogues can't index the data, and other researchers can't assess whether the data is relevant or trustworthy for their needs.

**How to fix it:**

1. **Rename columns** to be self-descriptive: `col1` → `soil_moisture_pct`, `col3` → `organic_carbon_g_per_kg`, `temp` → `air_temperature_degC`.
2. **Standardize missing data codes**: Pick one explicit code (`NA` is the R/Python convention) and use it consistently, not a mix of `NA`, `n/a`, `-999`, `??`, and blank cells.
3. **Adopt a metadata standard** for your discipline. Use directories like the Digital Curation Centre, RDA Metadata Standards, or FAIRsharing to find the right one.
4. **Use controlled vocabularies**: don't switch between "picture" and "image" or "location" and "site" for the same concept.

**Resources:**
- Digital Curation Centre metadata standards: https://www.dcc.ac.uk/guidance/standards/
- RDA Metadata Standards Catalog: https://rdamsc.bath.ac.uk/
- FAIRsharing: https://fairsharing.org/

## Topic 11: No Data Availability Statement (RDM Guide Problem 11)

**What's wrong:** The manuscript drafts in this project presumably describe the analysis, but there is no data availability statement: no information about where the data will be deposited, under what DOI, with what license, or how others can access it.

**Why it matters:** Without a data availability statement, readers of the published paper have no way to find or access the underlying data. Many journals now require these statements.

**How to fix it:** Include a statement in the manuscript, for example:

> "The data supporting this study's findings are openly available in EnviDat at https://doi.org/10.xxxx/xxxxx. The dataset includes soil chemistry measurements and temperature/humidity sensor readings from alpine sites in Switzerland (2026) and is available under a CC BY 4.0 license."

This should specify: the repository name, the DOI, what the dataset contains, and the license.

**Resources:**
- Springer Nature data availability statement examples: https://www.springernature.com/gp/authors/research-data-policy/data-availability-statements
- re3data (find a repository): https://www.re3data.org/

## Topic 12: No Persistent Identifier (DOI) (RDM Guide Problem 12)

**What's wrong:** None of the data has been deposited in a repository, so none of it has a DOI or any other persistent identifier. The data exists only on local machines.

**Why it matters:** Without a persistent identifier, there is no stable, citable reference to the data. Links can break, filenames can change, but a DOI is permanent. This violates the "findable" FAIR principle.

**How to fix it:** Deposit the data in a repository that assigns DOIs. Options relevant to this context include:

- **EnviDat**: the environmental data repository for WSL
- **Zenodo**: a general-purpose repository hosted by CERN (free, accepts any research output)
- **PSI Public Data Repository (SciCat)**: PSI's repository for experimental data, which can mint DOIs <!-- TODO(verify): confirm the official name and public URL of the PSI data repository / SciCat instance before publishing -->
- **ERIC** <!-- TODO(verify): confirm ERIC's actual scope (whole ETH Domain vs Eawag-specific) and its URL. The earlier wording "for ETH domain research" was questioned in review; do not restate it as fact until confirmed. -->

For any field, use re3data.org to find a discipline-specific repository that mints DOIs.

**Resources:**
- EnviDat: https://www.envidat.ch/
- Zenodo: https://zenodo.org/
- re3data: https://www.re3data.org/


## Lib4RI resources

Alongside the general references above, point players to our own material. The exact links and files still need to be added.

- Lib4RI RDM trainings <!-- TODO(add asset): link the current Lib4RI RDM training schedule / registration page -->
- Lib4RI OER (open educational resources) on RDM <!-- TODO(add asset): link the OER landing page -->
- The RDM infosheet and the poster produced with Estelle <!-- TODO(add asset): add the PDF(s); one of these can double as the downloadable end-of-game handout -->

**Training (separate from the reference links above)**

- Carpentries lessons (via Clemens Lange) <!-- TODO(add asset): confirm which Carpentries lessons to feature and add the link -->

**Handout:** a version of all this task text will be combined into a single downloadable handout offered at the end of the game. <!-- TODO(add asset): decide whether the handout is the Lib4RI RDM infosheet, the poster made with Estelle, or a purpose-built compilation, and wire up the download. -->
