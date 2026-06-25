import type { ContextTarget, Mapping, Trigger } from '../types';

/**
 * Given a right-click target and the mapping, return the first matching
 * problem ID, or null if no trigger matches.
 *
 * Iterates problems in mapping order — put higher-priority problems first
 * in mapping.json to resolve ambiguous overlaps.
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
