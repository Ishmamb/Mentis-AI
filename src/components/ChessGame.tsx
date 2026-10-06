import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  applyMove,
  BoardSquare,
  ChessBoard,
  ChessDifficulty,
  ChessPiece,
  createInitialBoard,
  formatMoveNotation,
  GameMode,
  getAllLegalMoves,
  getBestBotMove,
  getLegalMovesForSquare,
  isKingInCheck,
  Move,
  PIECE_SYMBOLS,
  PIECE_VALUES,
  PieceColor,
} from '../services/chessEngine';
import { Button } from './Button';
import { C, R } from '../theme';

interface ChessGameProps {
  onClose: () => void;
  onRecordGame?: (score: number, durationSec: number) => Promise<void>;
}

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 360);
const SQUARE_SIZE = Math.floor(BOARD_SIZE / 8);

export function ChessGame({ onClose, onRecordGame }: ChessGameProps) {
  const [board, setBoard] = useState<ChessBoard>(createInitialBoard());
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedSquare, setSelectedSquare] = useState<{ r: number; c: number } | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [history, setHistory] = useState<{ board: ChessBoard; turn: PieceColor; notation: string }[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<ChessPiece[]>([]); // pieces captured by white
  const [capturedBlack, setCapturedBlack] = useState<ChessPiece[]>([]); // pieces captured by black
  const [mode, setMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<ChessDifficulty>('tactical');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [gameOver, setGameOver] = useState<{ winner: PieceColor | 'draw' | null; reason: string } | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (gameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameOver]);

  // Check game over
  const evaluateEndgame = useCallback((currentBoard: ChessBoard, currentTurn: PieceColor) => {
    const legalMoves = getAllLegalMoves(currentBoard, currentTurn);
    if (legalMoves.length === 0) {
      const inCheck = isKingInCheck(currentBoard, currentTurn);
      if (inCheck) {
        const winner = currentTurn === 'w' ? 'b' : 'w';
        setGameOver({
          winner,
          reason: `Checkmate! ${winner === 'w' ? 'White' : 'Black'} wins!`,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        setGameOver({
          winner: 'draw',
          reason: 'Stalemate — No legal moves available. Game is drawn.',
        });
      }
    }
  }, []);

  // Bot response
  const triggerBotMove = useCallback(
    (currentBoard: ChessBoard) => {
      setIsBotThinking(true);
      setTimeout(() => {
        const botMove = getBestBotMove(currentBoard, 'b', difficulty);
        if (botMove) {
          const notation = formatMoveNotation(currentBoard, botMove);
          const captured = botMove.captured;
          const next = applyMove(currentBoard, botMove);

          if (captured) {
            setCapturedBlack(prev => [...prev, captured]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }

          setBoard(next);
          setTurn('w');
          setHistory(prev => [...prev, { board: currentBoard, turn: 'b', notation }]);
          evaluateEndgame(next, 'w');
        } else {
          evaluateEndgame(currentBoard, 'b');
        }
        setIsBotThinking(false);
      }, 450);
    },
    [difficulty, evaluateEndgame]
  );

  const onSquarePress = (r: number, c: number) => {
    if (gameOver || isBotThinking) return;

    const clickedPiece = board[r][c];

    // If an existing move target was tapped
    if (selectedSquare) {
      const targetMove = validMoves.find(m => m.toRow === r && m.toCol === c);
      if (targetMove) {
        // Execute move
        const notation = formatMoveNotation(board, targetMove);
        const captured = targetMove.captured;
        const nextBoard = applyMove(board, targetMove);

        if (captured) {
          if (turn === 'w') setCapturedWhite(prev => [...prev, captured]);
          else setCapturedBlack(prev => [...prev, captured]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }

        setBoard(nextBoard);
        setHistory(prev => [...prev, { board, turn, notation }]);
        setSelectedSquare(null);
        setValidMoves([]);

        const nextTurn: PieceColor = turn === 'w' ? 'b' : 'w';
        setTurn(nextTurn);
        evaluateEndgame(nextBoard, nextTurn);

        if (mode === 'ai' && nextTurn === 'b') {
          triggerBotMove(nextBoard);
        }
        return;
      }
    }

    // Select piece if it matches the current player
    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedSquare({ r, c });
      const moves = getLegalMovesForSquare(board, r, c);
      setValidMoves(moves);
      Haptics.selectionAsync().catch(() => {});
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const undoMove = () => {
    if (history.length === 0 || isBotThinking) return;
    const stepsToUndo = mode === 'ai' && history.length >= 2 ? 2 : 1;
    const targetIdx = history.length - stepsToUndo;

    if (targetIdx < 0) {
      resetGame();
      return;
    }

    const state = history[targetIdx];
    setBoard(state.board);
    setTurn(state.turn);
    setHistory(prev => prev.slice(0, targetIdx));
    setSelectedSquare(null);
    setValidMoves([]);
    setGameOver(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setTurn('w');
    setSelectedSquare(null);
    setValidMoves([]);
    setHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setGameOver(null);
    setSeconds(0);
    setIsBotThinking(false);
  };

  const saveResult = async () => {
    if (!onRecordGame) {
      onClose();
      return;
    }
    setIsSaving(true);
    try {
      const score = gameOver?.winner === 'w' ? 1000 : gameOver?.winner === 'draw' ? 500 : 250;
      await onRecordGame(score, seconds);
      Alert.alert('Match Recorded', `Your chess session was logged and +50 XP was awarded!`);
      onClose();
    } catch {
      Alert.alert('Session complete', 'Game recorded offline.');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // Material evaluation difference
  const whiteScore = capturedWhite.reduce((sum, p) => sum + (PIECE_VALUES[p.type] || 0), 0);
  const blackScore = capturedBlack.reduce((sum, p) => sum + (PIECE_VALUES[p.type] || 0), 0);
  const materialAdvantage = Math.round((whiteScore - blackScore) / 100);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const inCheck = isKingInCheck(board, turn);

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.gameTitle}>Mindful Chess</Text>
          <Text style={styles.gameSub}>
            {mode === 'ai' ? `vs Mindful AI (${difficulty})` : 'Pass & Play (2 Players)'}
          </Text>
        </View>
        <View style={styles.topRight}>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>⏱ {formatTime(seconds)}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>
      </View>

      {/* Mode & Difficulty Selector */}
      <View style={styles.controlsRow}>
        <View style={styles.segmented}>
          <Pressable
            style={[styles.segBtn, mode === 'ai' && styles.segBtnActive]}
            onPress={() => {
              setMode('ai');
              resetGame();
            }}
          >
            <Text style={[styles.segText, mode === 'ai' && styles.segTextActive]}>🤖 AI Bot</Text>
          </Pressable>
          <Pressable
            style={[styles.segBtn, mode === 'pass_and_play' && styles.segBtnActive]}
            onPress={() => {
              setMode('pass_and_play');
              resetGame();
            }}
          >
            <Text style={[styles.segText, mode === 'pass_and_play' && styles.segTextActive]}>👥 2-Player</Text>
          </Pressable>
        </View>

        {mode === 'ai' && (
          <View style={styles.diffRow}>
            {(['novice', 'tactical', 'grandmaster'] as ChessDifficulty[]).map(d => (
              <Pressable
                key={d}
                style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]}
                onPress={() => {
                  setDifficulty(d);
                  Haptics.selectionAsync().catch(() => {});
                }}
              >
                <Text style={[styles.diffText, difficulty === d && styles.diffTextActive]}>
                  {d[0].toUpperCase() + d.slice(1, 4)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Opponent (Black) Tray */}
      <View style={styles.tray}>
        <View style={styles.trayInfo}>
          <View style={[styles.colorDot, { backgroundColor: '#101827' }]} />
          <Text style={styles.trayLabel}>
            {mode === 'ai' ? `Mindful AI ${isBotThinking ? '💭 thinking…' : ''}` : 'Black'}
          </Text>
        </View>
        <View style={styles.capturedRow}>
          {capturedBlack.slice(0, 10).map((p, i) => (
            <Text key={i} style={styles.capturedPiece}>
              {PIECE_SYMBOLS.w[p.type]}
            </Text>
          ))}
          {materialAdvantage < 0 && (
            <Text style={styles.advantageText}>+{Math.abs(materialAdvantage)}</Text>
          )}
        </View>
      </View>

      {/* Chessboard */}
      <View style={styles.boardWrapper}>
        <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
          {board.map((row, r) => (
            <View key={r} style={styles.boardRow}>
              {row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
                const moveTarget = validMoves.find(m => m.toRow === r && m.toCol === c);
                const isThreat = moveTarget && !!moveTarget.captured;
                const isKingThreatened = inCheck && piece?.type === 'k' && piece?.color === turn;

                const tileBg = isSelected
                  ? '#C7D2FE'
                  : isLight
                  ? '#F0D9B5'
                  : '#B58863';

                return (
                  <Pressable
                    key={c}
                    onPress={() => onSquarePress(r, c)}
                    style={[
                      styles.square,
                      {
                        width: SQUARE_SIZE,
                        height: SQUARE_SIZE,
                        backgroundColor: tileBg,
                      },
                      isKingThreatened && styles.kingInCheck,
                    ]}
                  >
                    {/* Rank / File notations on edge */}
                    {c === 0 && (
                      <Text style={[styles.rankCoord, { color: isLight ? '#B58863' : '#F0D9B5' }]}>
                        {8 - r}
                      </Text>
                    )}
                    {r === 7 && (
                      <Text style={[styles.fileCoord, { color: isLight ? '#B58863' : '#F0D9B5' }]}>
                        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][c]}
                      </Text>
                    )}

                    {/* Piece Glyph */}
                    {piece && (
                      <Text
                        style={[
                          styles.pieceText,
                          {
                            color: piece.color === 'w' ? '#FFFFFF' : '#111827',
                            textShadowColor: piece.color === 'w' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.4)',
                            textShadowOffset: { width: 0, height: 1.5 },
                            textShadowRadius: 2,
                          },
                        ]}
                      >
                        {PIECE_SYMBOLS[piece.color][piece.type]}
                      </Text>
                    )}

                    {/* Move indicator dot or capture ring */}
                    {moveTarget && !isThreat && <View style={styles.moveDot} />}
                    {moveTarget && isThreat && <View style={styles.captureRing} />}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Player (White) Tray */}
      <View style={styles.tray}>
        <View style={styles.trayInfo}>
          <View style={[styles.colorDot, { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1' }]} />
          <Text style={styles.trayLabel}>You (White)</Text>
          {turn === 'w' && <View style={styles.turnBadge}><Text style={styles.turnText}>YOUR TURN</Text></View>}
        </View>
        <View style={styles.capturedRow}>
          {capturedWhite.slice(0, 10).map((p, i) => (
            <Text key={i} style={styles.capturedPiece}>
              {PIECE_SYMBOLS.b[p.type]}
            </Text>
          ))}
          {materialAdvantage > 0 && (
            <Text style={styles.advantageText}>+{materialAdvantage}</Text>
          )}
        </View>
      </View>

      {/* Action bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Undo"
          onPress={undoMove}
          variant="secondary"
          style={styles.actionBtn}
          disabled={history.length === 0 || isBotThinking}
        />
        <Button
          title="New Game"
          onPress={resetGame}
          variant="ghost"
          style={styles.actionBtn}
        />
      </View>

      {/* Move log */}
      {history.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
          {history.map((h, i) => (
            <View key={i} style={styles.historyChip}>
              <Text style={styles.historyIndex}>{Math.floor(i / 2) + 1}{i % 2 === 0 ? '.' : '..'}</Text>
              <Text style={styles.historyNotation}>{h.notation}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Game Over Modal */}
      <Modal visible={!!gameOver} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalKicker}>MATCH FINISHED</Text>
            <Text style={styles.modalTitle}>
              {gameOver?.winner === 'w' ? '🏆 Victory!' : gameOver?.winner === 'b' ? 'Defeat' : 'Draw'}
            </Text>
            <Text style={styles.modalBody}>{gameOver?.reason}</Text>

            <View style={styles.statsCard}>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{history.length}</Text>
                <Text style={styles.statLabel}>Moves</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{formatTime(seconds)}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={[styles.statVal, { color: C.green }]}>+50 XP</Text>
                <Text style={styles.statLabel}>Reward</Text>
              </View>
            </View>

            {isSaving ? (
              <ActivityIndicator color={C.primary} style={{ marginTop: 20 }} />
            ) : (
              <Button title="Claim XP & Return" onPress={saveResult} variant="dark" style={{ marginTop: 18 }} />
            )}
            <Button title="Play Again" onPress={resetGame} variant="ghost" style={{ marginTop: 8 }} />
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
    marginBottom: 12,
  },
  gameTitle: {
    color: C.ink,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  gameSub: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerBadge: {
    backgroundColor: C.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
  },
  timerText: {
    color: C.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 3,
  },
  segBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  segBtnActive: {
    backgroundColor: C.card,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  segText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  segTextActive: {
    color: C.ink,
    fontWeight: '900',
  },
  diffRow: {
    flexDirection: 'row',
    gap: 4,
  },
  diffBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: C.bg,
  },
  diffBtnActive: {
    backgroundColor: C.primarySoft,
  },
  diffText: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  diffTextActive: {
    color: C.primary,
    fontWeight: '800',
  },
  tray: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  trayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  trayLabel: {
    color: C.text,
    fontSize: 12,
    fontWeight: '800',
  },
  turnBadge: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  turnText: {
    color: C.green,
    fontSize: 8,
    fontWeight: '900',
  },
  capturedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  capturedPiece: {
    fontSize: 14,
    color: C.text,
  },
  advantageText: {
    color: C.primary,
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 4,
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  board: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#785433',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  boardRow: {
    flexDirection: 'row',
  },
  square: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  kingInCheck: {
    backgroundColor: '#FCA5A5',
  },
  pieceText: {
    fontSize: SQUARE_SIZE * 0.76,
    fontWeight: '600',
    textAlign: 'center',
  },
  rankCoord: {
    position: 'absolute',
    top: 1,
    left: 2,
    fontSize: 8,
    fontWeight: '800',
  },
  fileCoord: {
    position: 'absolute',
    bottom: 1,
    right: 2,
    fontSize: 8,
    fontWeight: '800',
  },
  moveDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(31, 157, 114, 0.75)',
  },
  captureRing: {
    position: 'absolute',
    width: SQUARE_SIZE - 4,
    height: SQUARE_SIZE - 4,
    borderRadius: (SQUARE_SIZE - 4) / 2,
    borderWidth: 3,
    borderColor: '#EF4444',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
  },
  historyScroll: {
    marginTop: 10,
    paddingVertical: 4,
  },
  historyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    gap: 3,
  },
  historyIndex: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  historyNotation: {
    color: C.ink,
    fontSize: 11,
    fontWeight: '800',
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
