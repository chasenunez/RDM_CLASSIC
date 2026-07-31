import { useRef, useCallback } from 'react';

// 500 ms matches typical mobile OS long-press threshold.
// Shorter feels like accidental; longer frustrates touch users.
const LONG_PRESS_MS = 500;

interface LongPressOptions {
  onLongPress: (e: TouchEvent) => void;
  onPress?: () => void; // fires on tap (no long press triggered)
}

export function useLongPress({ onLongPress, onPress }: LongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (e: React.TouchEvent) => {
      firedRef.current = false;
      startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        onLongPress(e.nativeEvent);
      }, LONG_PRESS_MS);
    },
    [onLongPress],
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const end = useCallback(() => {
    cancel();
    if (!firedRef.current && onPress) {
      onPress();
    }
    firedRef.current = false;
  }, [cancel, onPress]);

  const move = useCallback(
    (e: React.TouchEvent) => {
      if (!startPos.current) return;
      const dx = e.touches[0].clientX - startPos.current.x;
      const dy = e.touches[0].clientY - startPos.current.y;
      // Cancel if finger moved more than 10px (it's a scroll, not a press)
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) cancel();
    },
    [cancel],
  );

  return {
    onTouchStart: start,
    onTouchEnd: end,
    onTouchMove: move,
    onTouchCancel: cancel,
  };
}

/**
 * Long-press for grids and code listings, where a hook per cell or per line
 * isn't practical. One hook on the container works out which element the finger
 * is on, so touch users reach the same targets a right-click reaches.
 *
 * Without this, spreadsheet cells and code lines were mouse-only: the boss
 * battle and the code-quality problem were simply unplayable on a tablet, even
 * though the Rules dialog promised long-press worked.
 */
export function useLongPressWithin(
  selector: string,
  onLongPress: (el: HTMLElement, x: number, y: number) => void,
) {
  return useLongPress({
    onLongPress: e => {
      const touch = e.touches[0] ?? e.changedTouches[0];
      if (!touch) return;
      // The event's own target is the element under the finger, so there's no
      // need to look it up by coordinate.
      const match = (e.target as HTMLElement | null)?.closest<HTMLElement>(selector);
      if (match) onLongPress(match, touch.clientX, touch.clientY);
    },
  });
}
