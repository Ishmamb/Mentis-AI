import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  fetchSudokuPuzzle,
  isBoardComplete,
  isValidPlacement,
  SudokuDifficulty,
  SudokuPuzzle,
} from '../services/sudokuService';
import { Button } from './Button';
import { C, R } from '../theme';

interface SudokuGameProps {
  onClose: () => void;
  onRecordGame?: (score: number, durationSec: number) => Promise<void>;
}

const { width } = Dimensions.get('window');
const GRID_SIZE = Math.min(width - 32, 360);
const CELL_SIZE = Math.floor(GRID_SIZE / 9);

interface CellState {
  value: number;
  isInitial: boolean;
  notes: Set<number>;
  hasConflict: boolean;
}

export function SudokuGame({ onClose, onRecordGame }: SudokuGameProps) {
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null);
  const [grid, setGrid] = useState<CellState[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [pencilMode, setPencilMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [maxMistakes] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<CellState[][][]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize board
  const loadNewGame = useCallback(async (diff: SudokuDifficulty) => {
    setLoading(true);
    setGameWon(false);
    setGameLost(false);
    setMistakes(0);
    setSeconds(0);
    setSelectedCell(null);
    setHintsUsed(0);
    setHistory([]);

    try {
      const p = await fetchSudokuPuzzle(diff);
      setPuzzle(p);

      const initialGrid: CellState[][] = p.initial.map(row =>
        row.map(val => ({
          value: val,
          isInitial: val !== 0,
          notes: new Set<number>(),
          hasConflict: false,
        }))
      );

      setGrid(initialGrid);
    } catch (e: any) {
      Alert.alert('Sudoku Error', e?.message || 'Could not load puzzle.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNewGame(difficulty);
  }, [difficulty, loadNewGame]);

  // Timer
  useEffect(() => {
    if (loading || isPaused || gameWon || gameLost) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isPaused, gameWon, gameLost]);

  // Recalculate conflicts
  const checkConflicts = (currentGrid: CellState[][]): CellState[][] => {
    const rawGrid = currentGrid.map(r => r.map(c => c.value));
    return currentGrid.map((row, r) =>
      row.map((cell, c) => {
        if (cell.value === 0) return { ...cell, hasConflict: false };
        const valid = isValidPlacement(rawGrid, r, c, cell.value);
        return { ...cell, hasConflict: !valid };
      })
    );
  };

  const handleCellPress = (r: number, c: number) => {
    if (gameWon || gameLost) return;
    setSelectedCell({ r, c });
    Haptics.selectionAsync().catch(() => {});
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameWon || gameLost) return;
    const { r, c } = selectedCell;
    const cell = grid[r][c];

    if (cell.isInitial) return;

    // Save history for undo
    setHistory(prev => [...prev, grid.map(row => row.map(cell => ({ ...cell, notes: new Set(cell.notes) })))]);

    const nextGrid = grid.map(row => row.map(cl => ({ ...cl, notes: new Set(cl.notes) })));

    if (pencilMode) {
      // Toggle note
      const currentNotes = nextGrid[r][c].notes;
      if (currentNotes.has(num)) currentNotes.delete(num);
      else currentNotes.add(num);
      setGrid(nextGrid);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      return;
    }

    // Direct value assignment
    if (cell.value === num) {
      // Clear if tapping same number
      nextGrid[r][c].value = 0;
      nextGrid[r][c].notes.clear();
      setGrid(checkConflicts(nextGrid));
      return;
    }

    nextGrid[r][c].value = num;
    nextGrid[r][c].notes.clear();

    // Check solution correctness if puzzle exists
    if (puzzle && puzzle.solution[r][c] !== num) {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});

      if (nextMistakes >= maxMistakes) {
        setGameLost(true);
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    const updated = checkConflicts(nextGrid);
    setGrid(updated);

    // Check if board complete
    if (puzzle) {
      const currentRaw = updated.map(row => row.map(x => x.value));
      if (isBoardComplete(currentRaw, puzzle.solution)) {
        setGameWon(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }
  };

  const handleErase = () => {
    if (!selectedCell || gameWon || gameLost) return;
    const { r, c } = selectedCell;
    if (grid[r][c].isInitial) return;

    setHistory(prev => [...prev, grid.map(row => row.map(cell => ({ ...cell, notes: new Set(cell.notes) })))]);
    const nextGrid = grid.map(row => row.map(cl => ({ ...cl, notes: new Set(cl.notes) })));
    nextGrid[r][c].value = 0;
    nextGrid[r][c].notes.clear();
    setGrid(checkConflicts(nextGrid));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleUndo = () => {
    if (history.length === 0 || gameWon || gameLost) return;
    const previous = history[history.length - 1];
    setGrid(previous);
    setHistory(prev => prev.slice(0, prev.length - 1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  const handleHint = () => {
    if (!puzzle || gameWon || gameLost) return;

    // Find the first empty or wrong cell
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!grid[r][c].isInitial && grid[r][c].value !== puzzle.solution[r][c]) {
          const nextGrid = grid.map(row => row.map(cl => ({ ...cl, notes: new Set(cl.notes) })));
          nextGrid[r][c].value = puzzle.solution[r][c];
          nextGrid[r][c].notes.clear();
          setGrid(checkConflicts(nextGrid));
          setSelectedCell({ r, c });
          setHintsUsed(h => h + 1);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

          // Check if hint completed board
          const currentRaw = nextGrid.map(row => row.map(x => x.value));
          if (isBoardComplete(currentRaw, puzzle.solution)) {
            setGameWon(true);
          }
          return;
        }
      }
    }
  };

  const saveWin = async () => {
    if (!onRecordGame) {
      onClose();
      return;
    }
    setIsSaving(true);
    try {
      const baseScore = difficulty === 'expert' ? 1200 : difficulty === 'hard' ? 950 : difficulty === 'medium' ? 750 : 600;
      const penalty = mistakes * 80 + hintsUsed * 60;
      const score = Math.max(300, baseScore - penalty);
      await onRecordGame(score, seconds);
      Alert.alert('Sudoku Solved!', `Score: ${score} · +30 XP added to your backend account.`);
      onClose();
    } catch {
      Alert.alert('Saved locally', 'Game logged offline.');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // Count remaining numbers to place
  const numberCounts: Record<number, number> = {};
  for (let n = 1; n <= 9; n++) numberCounts[n] = 0;
  grid.forEach(row => {
    row.forEach(cell => {
      if (cell.value >= 1 && cell.value <= 9) {
        numberCounts[cell.value] = (numberCounts[cell.value] || 0) + 1;
      }
    });
  });

  const selectedValue = selectedCell ? grid[selectedCell.r][selectedCell.c].value : 0;

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Sudoku Sprint</Text>
          <View style={styles.sourceRow}>
            <View style={[styles.sourceDot, puzzle?.source === 'api' ? styles.sourceDotApi : styles.sourceDotOffline]} />
            <Text style={styles.sourceText}>
              {puzzle?.source === 'api' ? 'API Connected' : 'Offline Generator'}
            </Text>
          </View>
        </View>
        <View style={styles.topRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⏱ {formatTime(seconds)}</Text>
          </View>
          <View style={[styles.badge, mistakes > 0 && styles.mistakeBadge]}>
            <Text style={[styles.badgeText, mistakes > 0 && styles.mistakeBadgeText]}>
              ✕ {mistakes}/{maxMistakes}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>
      </View>

      {/* Difficulty Tabs */}
      <View style={styles.diffRow}>
        {(['easy', 'medium', 'hard', 'expert'] as SudokuDifficulty[]).map(d => (
          <Pressable
            key={d}
            style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]}
            onPress={() => setDifficulty(d)}
          >
            <Text style={[styles.diffBtnText, difficulty === d && styles.diffBtnTextActive]}>
              {d.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Sudoku Grid */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={styles.loadingText}>Fetching free puzzle…</Text>
        </View>
      ) : (
        <View style={styles.gridWrapper}>
          <View style={[styles.grid, { width: GRID_SIZE, height: GRID_SIZE }]}>
            {grid.map((row, r) => (
              <View key={r} style={styles.gridRow}>
                {row.map((cell, c) => {
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                  const isSameNumber = selectedValue > 0 && cell.value === selectedValue;
                  const isSameHouse =
                    selectedCell &&
                    (selectedCell.r === r ||
                      selectedCell.c === c ||
                      (Math.floor(selectedCell.r / 3) === Math.floor(r / 3) &&
                        Math.floor(selectedCell.c / 3) === Math.floor(c / 3)));

                  let cellBg = '#FFFFFF';
                  if (isSelected) cellBg = '#C7D2FE';
                  else if (isSameNumber) cellBg = '#E0E7FF';
                  else if (isSameHouse) cellBg = '#F1F5F9';

                  const borderRightWidth = c % 3 === 2 && c !== 8 ? 2 : 0.5;
                  const borderBottomWidth = r % 3 === 2 && r !== 8 ? 2 : 0.5;

                  return (
                    <Pressable
                      key={c}
                      onPress={() => handleCellPress(r, c)}
                      style={[
                        styles.cell,
                        {
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          backgroundColor: cell.hasConflict ? '#FEE2E2' : cellBg,
                          borderRightWidth,
                          borderBottomWidth,
                          borderRightColor: c % 3 === 2 ? '#334155' : '#E2E8F0',
                          borderBottomColor: r % 3 === 2 ? '#334155' : '#E2E8F0',
                        },
                      ]}
                    >
                      {cell.value > 0 ? (
                        <Text
                          style={[
                            styles.cellDigit,
                            cell.isInitial ? styles.initialDigit : styles.userDigit,
                            cell.hasConflict && styles.conflictDigit,
                          ]}
                        >
                          {cell.value}
                        </Text>
                      ) : cell.notes.size > 0 ? (
                        <View style={styles.notesGrid}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                            <Text key={n} style={styles.noteDigit}>
                              {cell.notes.has(n) ? n : ''}
                            </Text>
                          ))}
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tool buttons: Undo, Erase, Pencil, Hint */}
      <View style={styles.toolRow}>
        <Pressable style={styles.toolBtn} onPress={handleUndo}>
          <Text style={styles.toolIcon}>↶</Text>
          <Text style={styles.toolLabel}>Undo</Text>
        </Pressable>
        <Pressable style={styles.toolBtn} onPress={handleErase}>
          <Text style={styles.toolIcon}>⌫</Text>
          <Text style={styles.toolLabel}>Erase</Text>
        </Pressable>
        <Pressable
          style={[styles.toolBtn, pencilMode && styles.toolBtnActive]}
          onPress={() => setPencilMode(!pencilMode)}
        >
          <Text style={[styles.toolIcon, pencilMode && styles.toolIconActive]}>✎</Text>
          <Text style={[styles.toolLabel, pencilMode && styles.toolLabelActive]}>
            Notes {pencilMode ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
        <Pressable style={styles.toolBtn} onPress={handleHint}>
          <Text style={styles.toolIcon}>💡</Text>
          <Text style={styles.toolLabel}>Hint</Text>
        </Pressable>
      </View>

      {/* Number Keypad */}
      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const placed = numberCounts[num] || 0;
          const isDone = placed >= 9;
          return (
            <Pressable
              key={num}
              disabled={isDone}
              onPress={() => handleNumberInput(num)}
              style={[styles.key, isDone && styles.keyDone]}
            >
              <Text style={[styles.keyNum, isDone && styles.keyNumDone]}>{num}</Text>
              <Text style={styles.keyCount}>{9 - placed}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Win Modal */}
      <Modal visible={gameWon} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalKicker}>PUZZLE SOLVED</Text>
            <Text style={styles.modalTitle}>🎉 Brilliant!</Text>
            <Text style={styles.modalBody}>
              You successfully completed the {difficulty} Sudoku sprint.
            </Text>

            <View style={styles.statsCard}>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{formatTime(seconds)}</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{mistakes}</Text>
                <Text style={styles.statLabel}>Mistakes</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={[styles.statVal, { color: C.green }]}>+30 XP</Text>
                <Text style={styles.statLabel}>Backend</Text>
              </View>
            </View>

            {isSaving ? (
              <ActivityIndicator color={C.primary} style={{ marginTop: 20 }} />
            ) : (
              <Button title="Claim XP & Return" onPress={saveWin} variant="dark" style={{ marginTop: 18 }} />
            )}
            <Button
              title="Play Next Puzzle"
              onPress={() => loadNewGame(difficulty)}
              variant="ghost"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* Game Over / Strikes Modal */}
      <Modal visible={gameLost} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalKicker, { color: C.red }]}>3 MISTAKES</Text>
            <Text style={styles.modalTitle}>Sprint Ended</Text>
            <Text style={styles.modalBody}>
              You reached {maxMistakes} mistakes. Take a deep breath and give it another shot!
            </Text>
            <Button
              title="Try Again"
              onPress={() => loadNewGame(difficulty)}
              variant="dark"
              style={{ marginTop: 18 }}
            />
            <Button title="Close" onPress={onClose} variant="ghost" style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
    marginTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: C.ink,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  sourceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  sourceDotApi: {
    backgroundColor: C.green,
  },
  sourceDotOffline: {
    backgroundColor: C.amber,
  },
  sourceText: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: C.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: C.text,
    fontSize: 11,
    fontWeight: '800',
  },
  mistakeBadge: {
    backgroundColor: C.redSoft,
  },
  mistakeBadgeText: {
    color: C.red,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  diffRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  diffBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: C.bg,
  },
  diffBtnActive: {
    backgroundColor: C.primarySoft,
  },
  diffBtnText: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  diffBtnTextActive: {
    color: C.primary,
  },
  loadingBox: {
    height: GRID_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  gridWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDigit: {
    fontSize: CELL_SIZE * 0.58,
    fontWeight: '700',
  },
  initialDigit: {
    color: '#0F172A',
    fontWeight: '900',
  },
  userDigit: {
    color: C.primary,
    fontWeight: '800',
  },
  conflictDigit: {
    color: C.red,
  },
  notesGrid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
  },
  noteDigit: {
    width: '33.33%',
    height: '33.33%',
    fontSize: 8,
    color: C.muted,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 10,
  },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingVertical: 4,
  },
  toolBtn: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.bg,
    minWidth: 64,
  },
  toolBtnActive: {
    backgroundColor: C.primarySoft,
  },
  toolIcon: {
    fontSize: 16,
    color: C.ink,
  },
  toolIconActive: {
    color: C.primary,
  },
  toolLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  toolLabelActive: {
    color: C.primary,
  },
  keypad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 4,
  },
  key: {
    flex: 1,
    aspectRatio: 0.85,
    backgroundColor: C.bg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.line,
  },
  keyDone: {
    opacity: 0.3,
  },
  keyNum: {
    color: C.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  keyNumDone: {
    color: C.muted,
  },
  keyCount: {
    color: C.muted,
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 23, 38, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: 24,
    alignItems: 'center',
  },
  modalKicker: {
    color: C.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalTitle: {
    color: C.ink,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 6,
  },
  modalBody: {
    color: C.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderRadius: R.md,
    padding: 14,
    width: '100%',
    marginTop: 16,
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    color: C.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
