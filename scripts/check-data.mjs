#!/usr/bin/env node
/**
 * check-data.mjs: assert the invariants that hold the game's data together.
 *
 * The game is four hand-edited data sources (file-tree.json, problems.json,
 * mapping.json, learn-path.json) plus the fix actions in TypeScript, and
 * nothing in the type system notices when they drift apart. A trigger can name
 * a file that is not on screen, a fix can add a file that is not on disk, and
 * either mistake looks fine until someone plays that far. This script turns
 * those into a failing command.
 *
 * Run it with `npm run check-data`. It reads; it never writes to the project.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILES_DIR = join(ROOT, 'public/files');
// Icons are named by their served path ("/assets/code.png"), which is public/
// plus that path.
const PUBLIC_DIR = join(ROOT, 'public');

/** Files that belong at the top level of the finished project, by design. */
const TOP_LEVEL_BY_DESIGN = new Set(['README.md', 'LICENSE.md']);

/** Which viewers can carry which kind of in-file trigger. Mirrors the table in README.md. */
const TRIGGER_VIEWERS = {
  cell: ['csv', 'xlsx'],
  line: ['text'],
};

const failures = [];
const fail = (check, message) => failures.push({ check, message });

const readJson = rel => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));

/** Same, for a file that only exists on some branches. */
const readJsonIfPresent = rel =>
  existsSync(join(ROOT, rel)) ? readJson(rel) : null;

/**
 * fixActions.ts is the only description of what a fix does, so the checker
 * compiles it rather than restating it: a second copy of the rules could agree
 * with itself and still be wrong about the game. Compiling with the repo's own
 * TypeScript keeps this runnable on the Node 20 that CI uses, which cannot
 * import a .ts file directly.
 */
async function loadFixActions() {
  const outDir = join(ROOT, 'node_modules/.cache/rdm-check');
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  // The emitted file is ESM; say so locally in case this ever lands somewhere
  // that does not inherit the repo's "type": "module".
  writeFileSync(join(outDir, 'package.json'), '{"type":"module"}\n');

  execFileSync(
    process.execPath,
    [
      join(ROOT, 'node_modules/typescript/bin/tsc'),
      join(ROOT, 'src/lib/fixActions.ts'),
      '--rootDir', join(ROOT, 'src'),
      '--outDir', outDir,
      '--module', 'esnext',
      '--target', 'es2022',
      '--moduleResolution', 'bundler',
    ],
    { stdio: 'inherit' },
  );

  return import(pathToFileURL(join(outDir, 'lib/fixActions.js')).href);
}

const problems = readJson('src/data/problems.json');
const fileTree = readJson('src/data/file-tree.json');
const mapping = readJson('src/data/mapping.json');
// Learn mode lives on its own branch for now, so its curriculum may be absent.
const learnPath = readJsonIfPresent('src/data/learn-path.json');
const { FIX_ACTIONS, ORGANIZING_PROBLEM_ID, computeDisplayFiles, isRootLevel } = await loadFixActions();

// ── Shared lookups ───────────────────────────────────────────────────────────

const fixEntries = Object.entries(FIX_ACTIONS);
const addEntries = fixEntries.flatMap(([, action]) => action.add);
const treeNames = new Set(fileTree.map(e => e.name));
const addNames = new Set(addEntries.map(e => e.name));
const knownNames = new Set([...treeNames, ...addNames]);
const entryByName = new Map([...fileTree, ...addEntries].map(e => [e.name, e]));

const problemIds = new Set(problems.map(p => p.id));
const subProblemIds = new Set(problems.flatMap(p => (p.subProblems ?? []).map(s => s.id)));
const triggeredIds = new Set(
  mapping.problems.filter(p => p.triggers.length > 0).map(p => p.id),
);

// ── Checks ───────────────────────────────────────────────────────────────────

/**
 * Every file the game can show has to exist where the viewer will fetch it,
 * and so does the icon that stands for it. The icon check earns its keep when
 * unused artwork gets pruned: delete one that something still points at and
 * this says so, instead of the player meeting a broken image.
 */
function checkFilesOnDisk() {
  const named = [
    ...fileTree.map(e => ['file-tree.json', e]),
    ...fixEntries.flatMap(([id, action]) => action.add.map(e => [`FIX_ACTIONS.${id}.add`, e])),
  ];
  for (const [source, entry] of named) {
    // Folders a fix creates are made up; only files are fetched.
    if (entry.type !== 'folder' && !existsSync(join(FILES_DIR, entry.path))) {
      fail('files-on-disk', `${source}: ${entry.path} is not in public/files/`);
    }
    if (entry.icon && !existsSync(join(PUBLIC_DIR, entry.icon))) {
      fail('files-on-disk', `${source}: icon ${entry.icon} is not in public/`);
    }
  }
}

/**
 * computeDisplayFiles deduplicates within a fix's `add` but not against the
 * base tree, so a name in both renders twice once the fix is applied.
 */
function checkNoDuplicateAdds() {
  for (const [id, action] of fixEntries) {
    for (const entry of action.add) {
      if (treeNames.has(entry.name)) {
        fail('duplicate-add', `FIX_ACTIONS.${id} adds ${entry.name}, which is already in file-tree.json`);
      }
    }
  }
}

/** Archiving a file that was never removed would leave it in two windows at once. */
function checkArchiveIsSubsetOfRemove() {
  for (const [id, action] of fixEntries) {
    for (const name of action.archive) {
      if (!action.remove.includes(name)) {
        fail('archive-subset', `FIX_ACTIONS.${id} archives ${name} without removing it`);
      }
    }
  }
}

/** A trigger on a file that never appears is a problem the player cannot report. */
function checkTriggersReachable() {
  for (const problem of mapping.problems) {
    for (const trigger of problem.triggers) {
      if (!['file', 'cell', 'line'].includes(trigger.type)) continue;

      if (!knownNames.has(trigger.path)) {
        fail('trigger-reachable', `${problem.id}: trigger on ${trigger.path}, which no file entry provides`);
        continue;
      }
      const allowed = TRIGGER_VIEWERS[trigger.type];
      const viewer = entryByName.get(trigger.path)?.viewerType;
      if (allowed && !allowed.includes(viewer)) {
        fail(
          'trigger-reachable',
          `${problem.id}: ${trigger.type} trigger on ${trigger.path}, whose viewer is "${viewer}" (needs ${allowed.join(' or ')})`,
        );
      }
    }
  }
}

/** Mapping and problems.json have to be talking about the same problems. */
function checkProblemIds() {
  for (const entry of mapping.problems) {
    if (!problemIds.has(entry.id) && !subProblemIds.has(entry.id)) {
      fail('problem-ids', `mapping.json names ${entry.id}, which is not in problems.json`);
    }
    if (entry.parentId && !problemIds.has(entry.parentId)) {
      fail('problem-ids', `mapping.json: ${entry.id} has parentId ${entry.parentId}, which is not a problem`);
    }
  }
  for (const id of Object.keys(FIX_ACTIONS)) {
    if (!problemIds.has(id)) {
      fail('problem-ids', `FIX_ACTIONS has an entry for ${id}, which is not a problem`);
    }
  }
  // A problem is findable either directly or by completing its sub-problems.
  for (const problem of problems) {
    const hasSubs = (problem.subProblems ?? []).length > 0;
    if (!triggeredIds.has(problem.id) && !hasSubs) {
      fail('problem-ids', `${problem.id} has no triggers and no sub-problems, so it can never be found`);
    }
  }
  // Sub-problems are only ever reached by their own triggers.
  for (const id of subProblemIds) {
    if (!triggeredIds.has(id)) {
      fail('problem-ids', `sub-problem ${id} has no triggers, so its parent can never be completed`);
    }
  }
}

/** The missing-artifact menu grades by name, so names must be unambiguous. */
function checkMissingArtifactMenu() {
  const seen = new Set();
  for (const problem of mapping.problems) {
    for (const trigger of problem.triggers) {
      if (trigger.type !== 'project-absence') continue;
      if (seen.has(trigger.name)) {
        fail('missing-menu', `two problems claim the absence "${trigger.name}"`);
      }
      seen.add(trigger.name);
    }
  }
  for (const decoy of mapping.missingArtifactDecoys ?? []) {
    if (seen.has(decoy.name)) {
      fail('missing-menu', `decoy "${decoy.name}" collides with a real absence of the same name`);
    }
  }
}

/**
 * The organize map runs after each file has been renamed by its own fix, so it
 * must list post-fix names. Listing a pre-fix name fails silently: the file
 * simply never moves.
 */
function checkOrganizeMap() {
  const organize = FIX_ACTIONS[ORGANIZING_PROBLEM_ID]?.organize ?? {};
  const folderNames = new Set(
    (FIX_ACTIONS[ORGANIZING_PROBLEM_ID]?.add ?? []).map(e => e.name),
  );
  for (const [folder, names] of Object.entries(organize)) {
    if (!folderNames.has(`${folder}/`)) {
      fail('organize-map', `organize has a "${folder}" bucket but no ${folder}/ folder is added`);
    }
    for (const name of names) {
      if (!knownNames.has(name)) {
        fail('organize-map', `organize.${folder} lists ${name}, which no file entry provides`);
      }
    }
  }
}

/**
 * The payoff of the whole game: once every problem is fixed, nothing should be
 * loose at the top level except the documentation people look for first. A new
 * file that nobody added to the organize map shows up here.
 */
function checkFixedProjectIsTidy() {
  const finalFiles = computeDisplayFiles(fileTree, Object.keys(FIX_ACTIONS));
  for (const entry of finalFiles.filter(isRootLevel)) {
    if (!TOP_LEVEL_BY_DESIGN.has(entry.name)) {
      fail('fixed-project-tidy', `${entry.name} is still loose at the top level after every fix`);
    }
  }
}

/** Learn mode names files out loud ("Open fig1.jpg"), so they have to be there. */
function checkLearnPath() {
  if (!learnPath) return; // nothing to check on a branch without learn mode
  const steps = learnPath.tiers.flatMap(tier => tier.steps);
  if (steps.length === 0) fail('learn-path', 'the curriculum has no steps');
  for (const step of steps) {
    if (!problemIds.has(step.problemId)) {
      fail('learn-path', `step names ${step.problemId}, which is not in problems.json`);
    }
    if (step.target?.kind === 'file' && !treeNames.has(step.target.path)) {
      fail('learn-path', `step ${step.problemId} asks for ${step.target.path}, which is not in file-tree.json`);
    }
  }
}

// ── Run ──────────────────────────────────────────────────────────────────────

const checks = [
  checkFilesOnDisk,
  checkNoDuplicateAdds,
  checkArchiveIsSubsetOfRemove,
  checkTriggersReachable,
  checkProblemIds,
  checkMissingArtifactMenu,
  checkOrganizeMap,
  checkFixedProjectIsTidy,
  checkLearnPath,
];
checks.forEach(check => check());

if (failures.length === 0) {
  const skipped = learnPath ? '' : ' (learn-path skipped: no learn-path.json on this branch)';
  console.log(`check-data: ${checks.length} checks passed.${skipped}`);
  process.exit(0);
}

console.error(`check-data: ${failures.length} problem(s) found.\n`);
for (const { check, message } of failures) console.error(`  [${check}] ${message}`);
process.exit(1);
