import type { FileEntry } from '../types';

export interface FixAction {
  remove: string[];      // file names to hide from folder view
  archive: string[];     // file names to move to archive folder (must be subset of remove)
  add: FileEntry[];      // new file entries to display
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
  icon: '/icons/Text file.svg',
  viewerType: 'markdown',
  virtual: true,
};

const FOLDER: Omit<FileEntry, 'path' | 'name' | 'size'> = {
  type: 'folder',
  mimeGuess: 'inode/directory',
  icon: '/icons/Floppy.svg',
  viewerType: 'folder',
  virtual: true,
};

const XLSX_FILE: Omit<FileEntry, 'path' | 'name' | 'size'> = {
  type: 'file',
  mimeGuess: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  icon: '/icons/Text file.svg',
  viewerType: 'xlsx',
  virtual: true,
};

export const FIX_ACTIONS: Record<string, FixAction> = {
  'no-folder-structure': {
    remove: [],
    archive: [],
    add: [
      { ...FOLDER, path: '_fix/data', name: 'data/', size: 0 },
      { ...FOLDER, path: '_fix/code', name: 'code/', size: 0 },
      { ...FOLDER, path: '_fix/results', name: 'results/', size: 0 },
      { ...FOLDER, path: '_fix/reports', name: 'reports/', size: 0 },
    ],
  },

  'file-naming': {
    remove: [
      'soil samples.xlsx', 'cleaned data.xlsx', 'data_new.xlsx',
      'manuscript draft.docx', 'notes.txt', 'meeting_notes_feb.txt',
      'Figure 1.png',
    ],
    archive: [
      'soil samples.xlsx', 'cleaned data.xlsx', 'data_new.xlsx',
      'manuscript draft.docx', 'notes.txt', 'meeting_notes_feb.txt',
      'Figure 1.png',
    ],
    add: [
      { ...XLSX_FILE, path: '_fix/20260315_AlpineSoil_Chem_v1.xlsx', name: '20260315_AlpineSoil_Chem_v1.xlsx', size: 6200 },
      { ...MD, path: '_fix/20260501_AlpineSoil_Manuscript_v0.1.md', name: '20260501_AlpineSoil_Manuscript_v0.1.md', size: 3400 },
      { ...TEXT, path: '_fix/20260315_lab_notes.txt', name: '20260315_lab_notes.txt', size: 160 },
    ],
  },

  'versioning': {
    remove: [
      'manuscript_draft_v2_JK comments.docx',
      'script_old.py',
      'analysis v3 (Marias edits).py',
      'temp_humidity_FINAL.xlsx',
      'temp_humidity_FINAL_v2.xlsx',
      'temp_humidity_REALLY FINAL.xlsx',
    ],
    archive: [
      'manuscript_draft_v2_JK comments.docx',
      'script_old.py',
      'analysis v3 (Marias edits).py',
    ],
    add: [
      { ...FOLDER, path: '_fix/.git', name: '.git/', size: 0 },
    ],
  },

  'file-formats': {
    remove: [
      'sensor_output.dat',
      'microscopy_sample_12.jpg',
      'fig1_updated.jpg',
      'analysis_results_USE THIS ONE.docx',
    ],
    archive: [
      'sensor_output.dat',
      'microscopy_sample_12.jpg',
      'fig1_updated.jpg',
      'analysis_results_USE THIS ONE.docx',
    ],
    add: [
      { ...TEXT, path: '_fix/sensor_output.csv', name: 'sensor_output.csv', size: 360, mimeGuess: 'text/csv', viewerType: 'csv', icon: '/icons/Text file.svg' },
      { ...MD, path: '_fix/analysis_results.md', name: 'analysis_results.md', size: 3100 },
    ],
  },

  'no-readme': {
    remove: [],
    archive: [],
    add: [
      { ...MD, path: 'sample_project/README.md', name: 'README.md', size: 2400 },
    ],
  },

  'no-metadata': {
    remove: [],
    archive: [],
    add: [
      { ...MD, path: 'sample_project/data_dictionary.md', name: 'data_dictionary.md', size: 1800 },
    ],
  },

  'raw-processed-mixed': {
    remove: [],
    archive: [],
    add: [
      { ...FOLDER, path: '_fix/data/raw', name: 'data/raw/', size: 0 },
      { ...FOLDER, path: '_fix/data/processed', name: 'data/processed/', size: 0 },
    ],
  },

  'data-quality': {
    remove: ['soil samples.xlsx'],
    archive: ['soil samples.xlsx'],
    add: [
      { ...XLSX_FILE, path: '_fix/20260315_AlpineSoil_Chem_v1.xlsx', name: '20260315_AlpineSoil_Chem_v1.xlsx', size: 6200 },
    ],
  },

  'code-quality': {
    remove: ['script_old.py', 'analysis v3 (Marias edits).py', 'script.py'],
    archive: ['script_old.py', 'analysis v3 (Marias edits).py', 'script.py'],
    add: [
      {
        path: '_fix/20260410_AlpineSoil_Analysis_v1.0.py',
        name: '20260410_AlpineSoil_Analysis_v1.0.py',
        type: 'file',
        size: 800,
        mimeGuess: 'text/x-python',
        icon: '/icons/THINK Pascal.svg',
        viewerType: 'text',
        virtual: true,
      },
    ],
  },

  'no-license': {
    remove: [],
    archive: [],
    add: [
      { ...TEXT, path: 'sample_project/LICENSE', name: 'LICENSE', size: 1100 },
    ],
  },

  'no-data-availability': {
    remove: ['MANUSCRIPT FINAL SUBMISSION.docx'],
    archive: ['MANUSCRIPT FINAL SUBMISSION.docx'],
    add: [
      { ...MD, path: 'sample_project/20260501_AlpineSoil_Manuscript_v0.1.md', name: '20260501_AlpineSoil_Manuscript_v0.1.md', size: 3400 },
    ],
  },

  'no-doi': {
    remove: [],
    archive: [],
    add: [
      { ...MD, path: 'sample_project/ZENODO_DOI.md', name: 'ZENODO_DOI.md', size: 900 },
    ],
  },

  'no-backup': {
    remove: ['Figure 1 (1).png', 'data_new(1).xlsx'],
    archive: [],
    add: [],
  },
};

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

  const filtered = baseTree.filter(f => !toRemove.has(f.name));
  return [...filtered, ...uniqueAdd];
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
