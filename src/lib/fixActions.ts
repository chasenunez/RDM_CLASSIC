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
  'file-naming': {
    remove: [
      'manuscript draft.docx',
      'manuscript_draft_v2_JK comments.docx',
    ],
    archive: [
      'manuscript draft.docx',
      'manuscript_draft_v2_JK comments.docx',
    ],
    add: [
      { ...MD, path: 'sample_project/20260501_AlpineSoil_Manuscript_v0.1.docx', name: '20260501_AlpineSoil_Manuscript_v0.1.docx', size: 996 },
      { ...MD, path: 'sample_project/20260501_AlpineSoil_Manuscript_v0.2.docx', name: '20260501_AlpineSoil_Manuscript_v0.2.docx', size: 1512 },
    ],
  },

  'versioning': {
    remove: [],
    archive: [],
    add: [
      { ...FOLDER, path: '_fix/.git', name: '.git/', size: 0 },
    ],
  },

  'file-formats': {
    remove: ['fig1_updated.jpg', 'microscopy_sample_12.jpg'],
    archive: ['fig1_updated.jpg', 'microscopy_sample_12.jpg'],
    add: [
      { ...TEXT, path: 'sample_project/fig1_updated.png', name: 'fig1_updated.png', size: 18313, mimeGuess: 'image/png', viewerType: 'image', icon: '/icons/Paint file.svg' },
      { ...TEXT, path: 'sample_project/microscopy_sample_12.png', name: 'microscopy_sample_12.png', size: 22275, mimeGuess: 'image/png', viewerType: 'image', icon: '/icons/Paint file.svg' },
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
    // raw_data.xlsx lives in the Trash (see TrashView) until no-backup is fixed,
    // at which point it moves into the project folder as a recovered file.
    remove: [],
    archive: [],
    add: [
      { ...XLSX_FILE, path: 'sample_project/raw_data.xlsx', name: 'raw_data.xlsx', size: 18542 },
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
    remove: ['script.py'],
    archive: ['script.py'],
    add: [
      {
        path: 'sample_project/20260410_AlpineSoil_Analysis_v1.0.py',
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
      { ...MD, path: 'sample_project/LICENSE.md', name: 'LICENSE.md', size: 1100 },
    ],
  },

  'file-structure': {
    remove: [],
    archive: [],
    add: [
      { ...FOLDER, path: '_fix/data', name: 'data/', size: 0 },
      { ...FOLDER, path: '_fix/manuscripts', name: 'manuscripts/', size: 0 },
      { ...FOLDER, path: '_fix/code', name: 'code/', size: 0 },
    ],
    organize: {
      'data': ['raw_data.xlsx', 'fig1_updated.png', 'microscopy_sample_12.png', '20260315_AlpineSoil_Chem_v1.xlsx'],
      'manuscripts': [
        '20260501_AlpineSoil_Manuscript_v0.1.docx',
        '20260501_AlpineSoil_Manuscript_v0.2.docx',
      ],
      'code': ['20260410_AlpineSoil_Analysis_v1.0.py'],
    },
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

  let result: FileEntry[] = [
    ...baseTree.filter(f => !toRemove.has(f.name)),
    ...uniqueAdd,
  ];

  // If file-structure is fixed, reassign files into subfolder paths so they
  // disappear from the root view and appear inside the subfolder windows.
  if (fixedProblems.includes('file-structure')) {
    const organizeMap = FIX_ACTIONS['file-structure']?.organize ?? {};
    const nameToFolder: Record<string, string> = {};
    for (const [folder, names] of Object.entries(organizeMap)) {
      for (const name of names) nameToFolder[name] = folder;
    }
    result = result.map(f => {
      const folder = nameToFolder[f.name];
      return folder ? { ...f, path: `_sub/${folder}/${f.name}` } : f;
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
