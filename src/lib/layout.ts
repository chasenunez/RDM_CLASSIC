// Height of the System 7 menu bar (.menu-bar in mac.css). Shared so window
// centering and drag-clamping agree.
export const MENU_BAR_H = 30;

export function centeredAt(width: number, height: number, cascade = 0) {
  const vw = window.innerWidth;
  const vh = window.innerHeight - MENU_BAR_H;
  return {
    x: Math.max(0, Math.round((vw - width) / 2) + cascade),
    y: Math.max(MENU_BAR_H, MENU_BAR_H + Math.round((vh - height) / 2) + cascade),
  };
}
