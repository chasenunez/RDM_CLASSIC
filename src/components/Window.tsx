import React, { useRef, useCallback } from 'react';
import { useGame } from '../GameContext';
import { clampPosition } from '../lib/windowManager';

type Corner = 'nw' | 'ne' | 'sw' | 'se';

const CORNERS: Corner[] = ['nw', 'ne', 'sw', 'se'];
const CORNER_CURSOR: Record<Corner, string> = {
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
};

// Must match .window's min-width/min-height in mac.css
const MIN_WIDTH = 200;
const MIN_HEIGHT = 100;

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

  const onResizeMouseDown = useCallback(
    (corner: Corner) => (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      dispatch({ type: 'FOCUS_WINDOW', id });

      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startX = x;
      const startY = y;
      const startWidth = width;
      const startHeight = height;

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startMouseX;
        const dy = ev.clientY - startMouseY;

        const growsLeft = corner === 'nw' || corner === 'sw';
        const growsUp = corner === 'nw' || corner === 'ne';

        const rawWidth = growsLeft ? startWidth - dx : startWidth + dx;
        const rawHeight = growsUp ? startHeight - dy : startHeight + dy;
        const newWidth = Math.max(MIN_WIDTH, rawWidth);
        const newHeight = Math.max(MIN_HEIGHT, rawHeight);

        const newX = growsLeft ? startX + (startWidth - newWidth) : startX;
        const newY = growsUp ? startY + (startHeight - newHeight) : startY;

        dispatch({ type: 'RESIZE_WINDOW', id, x: newX, y: newY, width: newWidth, height: newHeight });
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [dispatch, id, x, y, width, height],
  );

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

      {CORNERS.map(corner => (
        <div
          key={corner}
          className={`window__resize-handle window__resize-handle--${corner}`}
          style={{ cursor: CORNER_CURSOR[corner] }}
          onMouseDown={onResizeMouseDown(corner)}
        />
      ))}
    </div>
  );
}
