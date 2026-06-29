import type { ContextTarget, Mapping, Trigger } from '../types';

/**
 * Given a right-click target and the mapping, return the first matching
 * problem ID (including sub-problem IDs), or null if no trigger matches.
 */
export function matchTrigger(target: ContextTarget, mapping: Mapping): string | null {
  for (const problem of mapping.problems) {
    for (const trigger of problem.triggers) {
      if (matches(target, trigger)) {
        return problem.id;
      }
    }
  }
  return null;
}

/**
 * Given a selected problem ID (from the dropdown) and a right-click target,
 * determine whether the selection is correct, wrong, or the target has no problem.
 *
 * Returns:
 *  'correct'       — selectedId matches the actual trigger for this target
 *  'wrong_problem' — target DOES have a problem, but a different one than selected
 *  'no_problem'    — target has no associated problem
 */
export type MatchResult = 'correct' | 'wrong_problem' | 'no_problem';

export function matchSelectedProblem(
  selectedId: string,
  target: ContextTarget,
  mapping: Mapping,
): MatchResult {
  const selectedEntry = mapping.problems.find(p => p.id === selectedId);

  // Direct trigger match for the selected problem
  if (selectedEntry) {
    const direct = selectedEntry.triggers.some(t => matches(target, t));
    if (direct) return 'correct';

    // Absence-triggered problems can be correctly reported from the desktop context
    const hasAbsenceTrigger = selectedEntry.triggers.some(t => t.type === 'project-absence');
    if (hasAbsenceTrigger && target.kind === 'desktop') return 'correct';
  }

  // Boss battle: check if the actual match is a sub-problem of the selected parent
  const actualMatchedId = matchTrigger(target, mapping);
  if (actualMatchedId) {
    const actualEntry = mapping.problems.find(p => p.id === actualMatchedId);
    if (actualEntry?.parentId && actualEntry.parentId === selectedId) {
      return 'correct';
    }
    // Target has a problem but user selected the wrong one
    return 'wrong_problem';
  }

  return 'no_problem';
}

/**
 * Get the parentId for a matched problem ID (for boss-battle sub-problems).
 */
export function getParentId(problemId: string, mapping: Mapping): string | undefined {
  return mapping.problems.find(p => p.id === problemId)?.parentId;
}

function matches(target: ContextTarget, trigger: Trigger): boolean {
  switch (trigger.type) {
    case 'file':
      return target.kind === 'file' && target.path === trigger.path;

    case 'cell':
      return (
        target.kind === 'cell' &&
        target.path === trigger.path &&
        target.row === trigger.row &&
        target.col === trigger.col
      );

    case 'line':
      return (
        target.kind === 'line' &&
        target.path === trigger.path &&
        target.line === trigger.line
      );

    case 'project-absence':
      return target.kind === 'absence' && target.name === trigger.name;

    case 'desktop':
      return target.kind === 'desktop';

    default:
      return false;
  }
}
