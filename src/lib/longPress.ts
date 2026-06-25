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
