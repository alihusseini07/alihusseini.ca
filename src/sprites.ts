export interface FolderPalette {
  base: string;
  light: string;
  dark: string;
  outline: string;
}

export interface FolderSprites {
  back: string;
  papers: string;
  front: string;
}

type ColorAt = (x: number, y: number) => string | null;

function spriteURI(cols: number, rows: number, colorAt: ColorAt): string {
  let rects = '';
  for (let y = 0; y < rows; y++) {
    let x = 0;
    while (x < cols) {
      const c = colorAt(x, y);
      if (c == null) { x++; continue; }
      let w = 1;
      while (x + w < cols && colorAt(x + w, y) === c) w++;
      rects += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${c}"/>`;
      x += w;
    }
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols} ${rows}" ` +
    `shape-rendering="crispEdges">${rects}</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

const PAPER_W      = '#fffdf6';
const PAPER_W2     = '#f6efdd';
const PAPER_BORDER = '#cdbb98';
const PAPER_LINE   = '#b8a679';

export function buildSprites({ base: M, light: H, dark: D, outline: K }: FolderPalette): FolderSprites {
  // FRONT pocket — 26×15
  const FC = 26, FR = 15;
  const front: ColorAt = (x, y) => {
    if ((x === 0 && y === 0) || (x === FC-1 && y === 0) || (x === 0 && y === FR-1) || (x === FC-1 && y === FR-1)) return null;
    if (y === 0 && x >= 10 && x <= 15) return null;
    if (y === 1 && x >= 10 && x <= 15) return K;
    if (x === 0 || x === FC-1 || y === 0 || y === FR-1) return K;
    if (y <= 2) return H;
    if (y >= FR-3) return D;
    if (x === 1) return H;
    if (x >= FC-2) return D;
    return M;
  };

  // BACK wall + tab — 26×19
  const BC = 26, BR = 19;
  const back: ColorAt = (x, y) => {
    const inTab = x >= 1 && x <= 10 && y >= 0 && y <= 3;
    if (inTab) {
      if (y === 0 || x === 1 || x === 10) return K;
      if (y === 1) return H;
      if (y === 3) return D;
      return M;
    }
    if (y < 3) return null;
    if (x === 0 || x === BC-1 || y === BR-1) return K;
    if (y === 3) return K;
    if (y === 4) return K;
    return D;
  };

  // PAPERS — 24×16
  const PC = 24, PR = 16;
  const paper: ColorAt = (x, y) => {
    const aIn = x >= 1 && x <= 20 && y >= 3 && y <= 15;
    const bIn = x >= 4 && x <= 23 && y >= 0 && y <= 12;
    if (aIn) {
      if (x === 1 || x === 20 || y === 3 || y === 15) return PAPER_BORDER;
      if ((y === 6 || y === 8 || y === 10) && x >= 3 && x <= 17) return PAPER_LINE;
      return PAPER_W;
    }
    if (bIn) {
      if (x === 4 || x === 23 || y === 0 || y === 12) return PAPER_BORDER;
      if ((y === 3 || y === 5 || y === 7) && x >= 6 && x <= 20) return PAPER_LINE;
      return PAPER_W2;
    }
    return null;
  };

  return {
    front:  spriteURI(FC, FR, front),
    back:   spriteURI(BC, BR, back),
    papers: spriteURI(PC, PR, paper),
  };
}
