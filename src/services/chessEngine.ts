export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type BoardSquare = ChessPiece | null;
export type ChessBoard = BoardSquare[][];

export interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  captured?: ChessPiece;
  promotion?: PieceType;
  notation?: string;
}

export type ChessDifficulty = 'novice' | 'tactical' | 'grandmaster';
export type GameMode = 'ai' | 'pass_and_play';

export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  },
};

export const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional bonuses for center control and development
const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

export function createInitialBoard(): ChessBoard {
  const board: ChessBoard = Array(8).fill(null).map(() => Array(8).fill(null));

  const backRank: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

  // Black pieces (ranks 0 and 1)
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRank[c], color: 'b' };
    board[1][c] = { type: 'p', color: 'b' };
  }

  // White pieces (ranks 6 and 7)
  for (let c = 0; c < 8; c++) {
    board[6][c] = { type: 'p', color: 'w' };
    board[7][c] = { type: backRank[c], color: 'w' };
  }

  return board;
}

export function cloneBoard(board: ChessBoard): ChessBoard {
  return board.map(row => row.map(sq => (sq ? { ...sq } : null)));
}

export function isInside(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// Generate pseudo-legal moves for a square
export function getPseudoLegalMoves(board: ChessBoard, r: number, c: number): Move[] {
  const piece = board[r][c];
  if (!piece) return [];

  const moves: Move[] = [];
  const color = piece.color;
  const oppColor: PieceColor = color === 'w' ? 'b' : 'w';

  if (piece.type === 'p') {
    const dir = color === 'w' ? -1 : 1;
    const startRank = color === 'w' ? 6 : 1;
    const promoRank = color === 'w' ? 0 : 7;

    // 1 square forward
    if (isInside(r + dir, c) && !board[r + dir][c]) {
      const isPromo = r + dir === promoRank;
      moves.push({
        fromRow: r,
        fromCol: c,
        toRow: r + dir,
        toCol: c,
        promotion: isPromo ? 'q' : undefined,
      });

      // 2 squares forward from start rank
      if (r === startRank && !board[r + 2 * dir][c]) {
        moves.push({
          fromRow: r,
          fromCol: c,
          toRow: r + 2 * dir,
          toCol: c,
        });
      }
    }

    // Diagonal captures
    for (const dc of [-1, 1]) {
      const nr = r + dir;
      const nc = c + dc;
      if (isInside(nr, nc)) {
        const target = board[nr][nc];
        if (target && target.color === oppColor) {
          const isPromo = nr === promoRank;
          moves.push({
            fromRow: r,
            fromCol: c,
            toRow: nr,
            toCol: nc,
            captured: target,
            promotion: isPromo ? 'q' : undefined,
          });
        }
      }
    }
  } else if (piece.type === 'n') {
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, dc] of knightOffsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (isInside(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.color === oppColor) {
          moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, captured: target || undefined });
        }
      }
    }
  } else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
    const dirs: number[][] = [];
    if (piece.type === 'b' || piece.type === 'q') {
      dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }
    if (piece.type === 'r' || piece.type === 'q') {
      dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }

    for (const [dr, dc] of dirs) {
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (!isInside(nr, nc)) break;
        const target = board[nr][nc];
        if (!target) {
          moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc });
        } else {
          if (target.color === oppColor) {
            moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, captured: target });
          }
          break;
        }
        step++;
      }
    }
  } else if (piece.type === 'k') {
    const kingOffsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];
    for (const [dr, dc] of kingOffsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (isInside(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.color === oppColor) {
          moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, captured: target || undefined });
        }
      }
    }
  }

  return moves;
}

export function findKing(board: ChessBoard, color: PieceColor): { r: number; c: number } | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) {
        return { r, c };
      }
    }
  }
  return null;
}

export function isKingInCheck(board: ChessBoard, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const oppColor: PieceColor = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === oppColor) {
        const pMoves = getPseudoLegalMoves(board, r, c);
        if (pMoves.some(m => m.toRow === kingPos.r && m.toCol === kingPos.c)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function applyMove(board: ChessBoard, move: Move): ChessBoard {
  const next = cloneBoard(board);
  const piece = next[move.fromRow][move.fromCol];
  if (!piece) return next;

  next[move.fromRow][move.fromCol] = null;
  if (move.promotion) {
    next[move.toRow][move.toCol] = { type: move.promotion, color: piece.color };
  } else {
    next[move.toRow][move.toCol] = piece;
  }
  return next;
}

// Full legal moves: filters out moves that leave king in check
export function getLegalMovesForSquare(board: ChessBoard, r: number, c: number): Move[] {
  const piece = board[r][c];
  if (!piece) return [];

  const pseudo = getPseudoLegalMoves(board, r, c);
  return pseudo.filter(m => {
    const after = applyMove(board, m);
    return !isKingInCheck(after, piece.color);
  });
}

export function getAllLegalMoves(board: ChessBoard, color: PieceColor): Move[] {
  const list: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        list.push(...getLegalMovesForSquare(board, r, c));
      }
    }
  }
  return list;
}

export function formatMoveNotation(board: ChessBoard, move: Move): string {
  const piece = board[move.fromRow][move.fromCol];
  if (!piece) return '';

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rank = 8 - move.toRow;
  const file = files[move.toCol];
  const targetSq = `${file}${rank}`;

  if (piece.type === 'p') {
    if (move.captured) {
      return `${files[move.fromCol]}x${targetSq}${move.promotion ? '=Q' : ''}`;
    }
    return `${targetSq}${move.promotion ? '=Q' : ''}`;
  }

  const pieceLetter = piece.type.toUpperCase();
  const captureMark = move.captured ? 'x' : '';
  return `${pieceLetter}${captureMark}${targetSq}`;
}

// Evaluate board score for AI (positive = good for White, negative = good for Black)
function evaluateBoard(board: ChessBoard): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      let val = PIECE_VALUES[p.type];

      if (p.type === 'p') {
        val += p.color === 'w' ? PAWN_TABLE[r][c] : PAWN_TABLE[7 - r][c];
      } else if (p.type === 'n') {
        val += p.color === 'w' ? KNIGHT_TABLE[r][c] : KNIGHT_TABLE[7 - r][c];
      }

      if (p.color === 'w') score += val;
      else score -= val;
    }
  }
  return score;
}

// Minimax with Alpha-Beta Pruning for Bot
export function getBestBotMove(
  board: ChessBoard,
  color: PieceColor = 'b',
  difficulty: ChessDifficulty = 'tactical'
): Move | null {
  const legalMoves = getAllLegalMoves(board, color);
  if (legalMoves.length === 0) return null;

  if (difficulty === 'novice') {
    // 60% chance to pick a capture if available, else random
    const captures = legalMoves.filter(m => !!m.captured);
    if (captures.length > 0 && Math.random() < 0.6) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const isMaximizing = color === 'w';
  const depth = difficulty === 'grandmaster' ? 2 : 1;

  let bestMove: Move = legalMoves[0];
  let bestScore = isMaximizing ? -Infinity : Infinity;

  // Shuffle slightly so games don't play identically every single time
  const shuffled = [...legalMoves].sort(() => Math.random() - 0.5);

  for (const move of shuffled) {
    const nextBoard = applyMove(board, move);
    const score = minimax(nextBoard, depth - 1, -Infinity, Infinity, !isMaximizing);

    if (isMaximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

function minimax(
  board: ChessBoard,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0) {
    return evaluateBoard(board);
  }

  const color: PieceColor = isMaximizing ? 'w' : 'b';
  const moves = getAllLegalMoves(board, color);

  if (moves.length === 0) {
    if (isKingInCheck(board, color)) {
      return isMaximizing ? -99999 : 99999; // Checkmate
    }
    return 0; // Stalemate
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const nextBoard = applyMove(board, move);
      const ev = minimax(nextBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const nextBoard = applyMove(board, move);
      const ev = minimax(nextBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
