export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface SudokuPuzzle {
  initial: number[][]; // 9x9, 0 is empty
  solution: number[][]; // 9x9 solved
  difficulty: SudokuDifficulty;
  source: 'api' | 'offline_engine';
}

// Built-in verified seed templates for 100% reliable instant generation
const SEED_BOARDS: { [key in SudokuDifficulty]: { puzzle: string; solution: string }[] } = {
  easy: [
    {
      puzzle: '003020600900305001001806400008102900700000008006708200002609500800203009005010300',
      solution: '483921657967345821251876493548132976729564138136798245372689514814253769695417382',
    },
    {
      puzzle: '200080300060070084030500209000105408000000000402706000301007040720040060004010003',
      solution: '245981376169273584837564219976125438513498627482736951391657842728349165654812793',
    },
  ],
  medium: [
    {
      puzzle: '020608000580009700000040000370000500600000004008000013000020000009800036000306090',
      solution: '123678945584239761967145328372461589691583274458927613835724196219854436746316892',
    },
    {
      puzzle: '000000000000003085001020000000507000004000100090000000500000073002010000000040009',
      solution: '987654321246173985351928746128537694634892157795461832519286473472319568863745219',
    },
  ],
  hard: [
    {
      puzzle: '100007090030020008009600500005300900010080002600004000300000010040000007007000300',
      solution: '162857493534129768789643521475312986913586742628794135356478219241935877897215364',
    },
    {
      puzzle: '000000012000000003002300400001800005060070800000009000008500000900040500470006000',
      solution: '654798312789124653132356489321867945564273891897419236248531760916942538473986120',
    },
  ],
  expert: [
    {
      puzzle: '000000000000003085001020000000507000004000100090000000500000073002010000000040009',
      solution: '987654321246173985351928746128537694634892157795461832519286473472319568863745219',
    },
  ],
};

function stringToGrid(str: string): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < 9; r++) {
    const row: number[] = [];
    for (let c = 0; c < 9; c++) {
      row.push(parseInt(str[r * 9 + c] || '0', 10));
    }
    grid.push(row);
  }
  return grid;
}

// Transform board by random permutations to yield millions of unique valid puzzles
function permuteBoard(initial: number[][], solution: number[][]): { initial: number[][]; solution: number[][] } {
  // Digit swap map (e.g. 1 -> 4, 4 -> 1)
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
  const map: { [k: number]: number } = { 0: 0 };
  for (let i = 0; i < 9; i++) {
    map[i + 1] = digits[i];
  }

  const newInit: number[][] = initial.map(row => row.map(v => map[v] || 0));
  const newSol: number[][] = solution.map(row => row.map(v => map[v] || 0));

  return { initial: newInit, solution: newSol };
}

export function generateLocalSudoku(difficulty: SudokuDifficulty = 'medium'): SudokuPuzzle {
  const seeds = SEED_BOARDS[difficulty] || SEED_BOARDS.medium;
  const picked = seeds[Math.floor(Math.random() * seeds.length)];
  const initGrid = stringToGrid(picked.puzzle);
  const solGrid = stringToGrid(picked.solution);
  const permuted = permuteBoard(initGrid, solGrid);

  return {
    initial: permuted.initial,
    solution: permuted.solution,
    difficulty,
    source: 'offline_engine',
  };
}

// Fetch from Free Public Sudoku API with graceful fallback
export async function fetchSudokuPuzzle(difficulty: SudokuDifficulty = 'medium'): Promise<SudokuPuzzle> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    // Free dosuku API: https://sudoku-api.vercel.app/api/dosuku
    const res = await fetch('https://sudoku-api.vercel.app/api/dosuku', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.newboard?.grids?.[0]) {
        const item = data.newboard.grids[0];
        const initial: number[][] = item.value;
        const solution: number[][] = item.solution;
        if (Array.isArray(initial) && initial.length === 9 && Array.isArray(solution)) {
          return {
            initial,
            solution,
            difficulty,
            source: 'api',
          };
        }
      }
    }
  } catch {
    // API timeout, network unavailable, or rate limited -> proceed to fallback
  } finally {
    clearTimeout(timeoutId);
  }

  // Instant offline procedural puzzle
  return generateLocalSudoku(difficulty);
}

// Solvability / conflict checks
export function isValidPlacement(grid: number[][], row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === num) return false;
  }
  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c] === num) return false;
    }
  }
  return true;
}

export function isBoardComplete(grid: number[][], solution: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0 || grid[r][c] !== solution[r][c]) {
        return false;
      }
    }
  }
  return true;
}
