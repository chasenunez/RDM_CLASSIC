const MENU_BAR_H = 30;

export function centeredAt(width: number, height: number, cascade = 0) {
  const vw = window.innerWidth;
  const vh = window.innerHeight - MENU_BAR_H;
  return {
    x: Math.max(0, Math.round((vw - width) / 2) + cascade),
    y: Math.max(MENU_BAR_H, MENU_BAR_H + Math.round((vh - height) / 2) + cascade),
  };
}
