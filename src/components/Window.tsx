import React, { useRef, useCallback } from 'react';
import { useGame } from '../GameContext';
import { clampPosition } from '../lib/windowManager';

interface WindowProps {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  focused: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Window({
  id,
  title,
  x,
  y,
  width,
  height,
  zIndex,
  focused,
  onClose,
  children,
}: WindowProps) {
  const { dispatch } = useGame();
  const isDragging = useRef(false);

  const onTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // only left click
      e.preventDefault();
      dispatch({ type: 'FOCUS_WINDOW', id });

      const startX = e.clientX - x;
      const startY = e.clientY - y;
      isDragging.current = true;

      const onMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const newX = ev.clientX - startX;
        const newY = ev.clientY - startY;
        const clamped = clampPosition(newX, newY, width);
        dispatch({ type: 'MOVE_WINDOW', id, ...clamped });
      };

      const onUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [dispatch, id, x, y, width, height],
  );

  const onBodyMouseDown = useCallback(() => {
    if (!focused) dispatch({ type: 'FOCUS_WINDOW', id });
  }, [dispatch, focused, id]);

  return (
    <div
      className={`window no-select${focused ? ' focused' : ''}`}
      style={{ left: x, top: y, width, height, zIndex }}
      onMouseDown={onBodyMouseDown}
    >
      <div
        className="window__title-bar"
        onMouseDown={onTitleMouseDown}
        role="toolbar"
        aria-label={`Window: ${title}`}
      >
        <button
          className="window__close"
          onClick={e => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close window"
          title="Close"
        >
          ×
        </button>
        <span className="window__title">{title}</span>
      </div>
      <div className="window__body">{children}</div>
    </div>
  );
}
