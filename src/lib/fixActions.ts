import type { FileEntry } from '../types';

export interface FixAction {
  remove: string[];      // file names to hide from folder view
  archive: string[];     // file names to move to archive folder (must be subset of remove)
  add: FileEntry[];      // new file entries to display
  organize?: Record<string, string[]>;  // subfolder name → file names to move into it
}

const TEXT: Omit<FileEntry, 'path' | 'name' | 'size'> = {
  type: 'file',
  mimeGuess: 'text/plain',
  icon: '/icons/Text file.svg',
  viewerType: 'text',
  virtual: true,
};

const MD: Omit<FileEntry, 'path' | 'name' | 'size'> = {
  type: 'file',
  mimeGuess: 'text/markdown',
  icon: '/assets/md.png',
  viewerType: 'markdown',
  virtual: true,
};

const FOLDER: Omit<FileEntry, 'path' | 'name' | 'size'> = {
  type: 'folder',
  mimeGuess: 'inode/directory',
  icon: '/assets/folder.png',
  viewerType: 'folder',
  virtual: true,
};

const XLSX_FILE: Omit<FileEntry, 'path' | 'name' | 'size'> = {
  type: 'file',
  mimeGuess: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  icon: '/assets/spreadsheet.png',
  viewerType: 'xlsx',
  virtual: true,
};

export const FIX_ACTIONS: Record<string, FixAction> = {
  // File naming is now scoped to a single file: the space-in-name manuscript
  // is replaced with one following the naming convention (v1.0).
  'file-naming': {
    remove: ['manuscript draft.docx'],
    archive: ['manuscript draft.docx'],
    add: [
      { ...MD, icon: '/assets/manuscript.png', path: 'sample_project/20260501_AlpineSoil_Manuscript_v1.0.docx', name: '20260501_AlpineSoil_Manuscript_v1.0.docx', size: 996 },
    ],
  },

  // Versioning is now scoped to files: the ad-hoc "v2 / JK comments" manuscript
  // becomes a properly versioned copy (v1.1) that continues from v1.0.
  'versioning': {
    remove: ['manuscript_draft_v2_JK comments.docx'],
    archive: ['manuscript_draft_v2_JK comments.docx'],
    add: [
      { ...MD, icon: '/assets/manuscript.png', path: 'sample_project/20260501_AlpineSoil_Manuscript_v1.1.docx', name: '20260501_AlpineSoil_Manuscript_v1.1.docx', size: 1512 },
    ],
  },

  // Organising the project sorts the files the moment the player earns it,
  // rather than deferring to a separate end-of-game step that re-taught the
  // same lesson. Files land in subfolders by name via `organize` below.
  'folder-organization': {
    remove: [],
    archive: [],
    add: [
      { ...FOLDER, path: '_fix/data', name: 'data/', size: 0 },
      { ...FOLDER, path: '_fix/manuscripts', name: 'manuscripts/', size: 0 },
      { ...FOLDER, path: '_fix/code', name: 'code/', size: 0 },
    ],
    organize: {
      // Matched *before* the file-formats csv conversion, so list the .xlsx
      // names here even though they may render as .csv afterwards. README.md
      // and LICENSE.md stay at the top level on purpose: that is where anyone
      // opening the project looks first.
      'data': [
        'raw_alpine_soil_data.xlsx',
        'soil samples.xlsx',
        '20260315_AlpineSoil_Chem_v1.0.xlsx',
        'fig1.png',
        'microscopy_sample_12.png',
      ],
      'manuscripts': [
        '20260501_AlpineSoil_Manuscript_v1.0.docx',
        '20260501_AlpineSoil_Manuscript_v1.1.docx',
      ],
      'code': ['20260410_AlpineSoil_Analysis_v1.0.py'],
    },
  },

  // Version control is its own lesson with its own payoff: the project gains a
  // repository, so its history starts being recorded.
  'no-version-control': {
    remove: [],
    archive: [],
    add: [
      { ...FOLDER, path: '_fix/.git', name: '.git/', size: 0 },
    ],
  },

  'file-formats': {
    remove: ['fig1.jpg', 'microscopy_sample_12.jpg'],
    archive: ['fig1.jpg', 'microscopy_sample_12.jpg'],
    add: [
      { ...TEXT, path: 'sample_project/fig1.png', name: 'fig1.png', size: 18313, mimeGuess: 'image/png', viewerType: 'image', icon: '/assets/image.png' },
      { ...TEXT, path: 'sample_project/microscopy_sample_12.png', name: 'microscopy_sample_12.png', size: 22275, mimeGuess: 'image/png', viewerType: 'image', icon: '/assets/microscope.png' },
    ],
  },

  'no-readme': {
    remove: [],
    archive: [],
    add: [
      { ...MD, path: 'sample_project/README.md', name: 'README.md', size: 2400 },
    ],
  },

  'no-backup': {
    // raw_alpine_soil_data.xlsx lives in the Trash (see TrashView) until
    // no-backup is fixed, at which point it moves into the project folder as a
    // recovered file.
    remove: [],
    archive: [],
    add: [
      { ...XLSX_FILE, path: 'sample_project/raw_alpine_soil_data.xlsx', name: 'raw_alpine_soil_data.xlsx', size: 18542 },
    ],
  },

  // Applied when the player wins the boss battle. The messy spreadsheet is
  // archived rather than deleted (raw data is never destroyed) and the cleaned,
  // properly named copy takes its place in the project.
  'data-quality': {
    remove: ['soil samples.xlsx'],
    archive: ['soil samples.xlsx'],
    add: [
      { ...XLSX_FILE, path: 'sample_project/20260315_AlpineSoil_Chem_v1.0.xlsx', name: '20260315_AlpineSoil_Chem_v1.0.xlsx', size: 18127 },
    ],
  },

  'code-quality': {
    remove: ['script.py'],
    archive: ['script.py'],
    add: [
      {
        path: 'sample_project/20260410_AlpineSoil_Analysis_v1.0.py',
        name: '20260410_AlpineSoil_Analysis_v1.0.py',
        type: 'file',
        size: 800,
        mimeGuess: 'text/x-python',
        icon: '/assets/code.png',
        viewerType: 'text',
        virtual: true,
      },
    ],
  },

  'no-license': {
    remove: [],
    archive: [],
    add: [
      { ...MD, path: 'sample_project/LICENSE.md', name: 'LICENSE.md', size: 1100 },
    ],
  },

};

// The problem whose fix sorts files into subfolders. Named once here so the
// display logic and the folder-view double-click handler agree.
export const ORGANIZING_PROBLEM_ID = 'folder-organization';

// The interactive boss-battle spreadsheet keeps its .xlsx grid + viewer even
// after the file-formats fix — converting it to CSV would break the minigame
// (its cell coordinates in mapping.json and the XlsxViewer boss handling both
// key off the "soil samples.xlsx" name). Every other .xlsx is converted.
const CSV_CONVERSION_EXEMPT = new Set(['soil samples.xlsx']);

export function computeDisplayFiles(
  baseTree: FileEntry[],
  fixedProblems: string[],
): FileEntry[] {
  const toRemove = new Set<string>();
  const toAdd: FileEntry[] = [];

  for (const problemId of fixedProblems) {
    const action = FIX_ACTIONS[problemId];
    if (!action) continue;
    action.remove.forEach(n => toRemove.add(n));
    action.add.forEach(f => toAdd.push(f));
  }

  // Deduplicate added files by name
  const addedNames = new Set<string>();
  const uniqueAdd = toAdd.filter(f => {
    if (addedNames.has(f.name)) return false;
    addedNames.add(f.name);
    return true;
  });

  let result: FileEntry[] = [
    ...baseTree.filter(f => !toRemove.has(f.name)),
    ...uniqueAdd,
  ];

  // Once the project is organised, reassign files into subfolder paths so they
  // disappear from the root view and appear inside the subfolder windows.
  if (fixedProblems.includes(ORGANIZING_PROBLEM_ID)) {
    const organizeMap = FIX_ACTIONS[ORGANIZING_PROBLEM_ID]?.organize ?? {};
    const nameToFolder: Record<string, string> = {};
    for (const [folder, names] of Object.entries(organizeMap)) {
      for (const name of names) nameToFolder[name] = folder;
    }
    result = result.map(f => {
      const folder = nameToFolder[f.name];
      return folder ? { ...f, path: `_sub/${folder}/${f.name}` } : f;
    });
  }

  // After the file-formats fix, proprietary .xlsx data files are re-saved as
  // open .csv files. Rewrite the display entry (name, path, viewer, mime) so
  // the file opens in the CSV viewer. Runs after the organize step so a file
  // already moved into a subfolder keeps its subfolder path.
  if (fixedProblems.includes('file-formats')) {
    result = result.map(f => {
      if (f.type !== 'file' || !f.name.endsWith('.xlsx')) return f;
      if (CSV_CONVERSION_EXEMPT.has(f.name)) return f;
      return {
        ...f,
        name: f.name.replace(/\.xlsx$/, '.csv'),
        path: f.path.replace(/\.xlsx$/, '.csv'),
        viewerType: 'csv',
        mimeGuess: 'text/csv',
      };
    });
  }

  return result;
}

export function computeArchiveFiles(
  baseTree: FileEntry[],
  fixedProblems: string[],
): FileEntry[] {
  const toArchive = new Set<string>();

  for (const problemId of fixedProblems) {
    const action = FIX_ACTIONS[problemId];
    if (!action) continue;
    action.archive.forEach(n => toArchive.add(n));
  }

  return baseTree.filter(f => toArchive.has(f.name));
}
