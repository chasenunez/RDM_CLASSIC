import learnPathData from '../data/learn-path.json';
import type { LearnPath, LearnStep, LearnTier, Problem, SubProblem, TourStop } from '../types';

/**
 * Helpers for walking the learn-mode curriculum.
 *
 * The curriculum is a list of tiers, each holding steps, but the player moves
 * through it as one flat sequence. Everything here converts between those two
 * views so the components never have to do index arithmetic across tiers.
 */

export const LEARN_PATH = learnPathData as LearnPath;

/** A step plus where it sits, so a component can render it without searching. */
export interface FlatStep {
  step: LearnStep;
  tier: LearnTier;
  tierIndex: number;
  /** Position in the whole curriculum, which is what `learnStep` stores. */
  index: number;
  /** True for the first step of its tier, which is where the tier intro shows. */
  firstOfTier: boolean;
}

/** The curriculum as one ordered list. Built once; the data never changes. */
export const FLAT_STEPS: FlatStep[] = LEARN_PATH.tiers.flatMap((tier, tierIndex) =>
  tier.steps.map((step, i) => ({
    step,
    tier,
    tierIndex,
    index: 0, // replaced below, once the full order is known
    firstOfTier: i === 0,
  })),
).map((s, index) => ({ ...s, index }));

export const TOTAL_STEPS = FLAT_STEPS.length;

/** The step the player is on, or null once they have finished. */
export function stepAt(index: number): FlatStep | null {
  return FLAT_STEPS[index] ?? null;
}

/**
 * Resolve a step's tour into displayable stops.
 *
 * A step may say `"subProblems"`, meaning "use the sub-problems this problem
 * already has in problems.json" (that is how the spreadsheet minigame avoids
 * duplicating its nine lessons), or carry explicit stops of its own.
 * Explicit stops may still `ref` a sub-problem for their wording.
 */
export function resolveTour(step: LearnStep, problem: Problem | undefined): ResolvedStop[] {
  if (!step.tour || !problem) return [];

  const subs = problem.subProblems ?? [];
  const byId = new Map(subs.map(s => [s.id, s]));

  if (step.tour === 'subProblems') {
    return subs.map(sub => ({
      id: sub.id,
      name: sub.name,
      what: sub.what,
      why: sub.why,
      cells: undefined,
      lines: undefined,
    }));
  }

  return step.tour.map(stop => fromStop(stop, byId.get(stop.ref ?? '')));
}

/** A tour stop with its text resolved, ready to render. */
export interface ResolvedStop {
  id: string;
  name: string;
  what: string;
  why: string;
  cells?: [number, number][];
  lines?: number[];
}

function fromStop(stop: TourStop, ref: SubProblem | undefined): ResolvedStop {
  return {
    id: stop.id,
    name: stop.name ?? ref?.name ?? stop.id,
    what: stop.what ?? ref?.what ?? '',
    why: stop.why ?? ref?.why ?? '',
    cells: stop.cells,
    lines: stop.lines,
  };
}

/**
 * Does opening this file satisfy the current step?
 *
 * Learn mode is guided but hands-on: the coach names a file and the lesson
 * opens when the player opens that file. This is the check behind that.
 */
export function targetMatchesFile(step: LearnStep | undefined, fileName: string): boolean {
  return step?.target?.kind === 'file' && step.target.path === fileName;
}

export function targetIsTrash(step: LearnStep | undefined): boolean {
  return step?.target?.kind === 'trash';
}
