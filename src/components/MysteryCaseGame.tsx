import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from './Button';
import { C, R } from '../theme';

interface MysteryCaseGameProps {
  onClose: () => void;
  onRecordGame?: (score: number, durationSec: number) => Promise<void>;
}

export function MysteryCaseGame({ onClose, onRecordGame }: MysteryCaseGameProps) {
  const [selectedClue, setSelectedClue] = useState<number | null>(null);
  const [accused, setAccused] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const clues = [
    {
      title: 'Clue 1: The Broken Pocket Watch',
      detail: 'Found near the archive display case. Crystal is cracked and hands are frozen at exactly 10:42 PM.',
    },
    {
      title: 'Clue 2: The Wet Umbrellas',
      detail: 'Heavy rain began at 10:35 PM. Only one umbrella in the coat rack is completely dry: Dr. Vance’s coat rack slot.',
    },
    {
      title: 'Clue 3: The Cipher Note',
      detail: 'Left on the study table: "The falcon departs before the second chime." Dr. Vance is a recognized expert in avian heraldry.',
    },
  ];

  const suspects = [
    {
      name: 'Julian (Archivist)',
      alibi: 'Claims he was cataloging books in the basement until 11:00 PM. His jacket has damp shoulder patches.',
      isCulprit: false,
    },
    {
      name: 'Dr. Vance (Visiting Scholar)',
      alibi: 'Claims he walked across town in the torrential storm and arrived at 10:40 PM, yet his umbrella and trench coat were bone dry.',
      isCulprit: true,
    },
    {
      name: 'Clara (Appraiser)',
      alibi: 'Was on a video phone call with her overseas client from 10:30 PM to 11:15 PM verified by call logs.',
      isCulprit: false,
    },
  ];

  const handleAccusation = (suspect: typeof suspects[0]) => {
    setAccused(suspect.name);
    if (suspect.isCulprit) {
      setIsWon(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      setIsFailed(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  };

  const handleClaim = async () => {
    if (!onRecordGame) {
      onClose();
      return;
    }
    setIsSaving(true);
    try {
      await onRecordGame(880, 120);
      Alert.alert('Mystery Solved', 'Deductive case closed! +35 XP awarded.');
      onClose();
    } catch {
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>The Midnight Archive</Text>
          <Text style={styles.subtitle}>Case #104 · Deductive Reasoning Challenge</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.briefCard}>
        <Text style={styles.briefKicker}>INCIDENT BRIEF</Text>
        <Text style={styles.briefText}>
          At 10:45 PM, the rare Silver Codex was reported missing from the Faculty Archive. Heavy rain poured outside. Inspect the evidence and deduce the culprit.
        </Text>
      </View>

      <Text style={styles.sectionHeader}>Inspect Evidence</Text>
      <View style={styles.clueList}>
        {clues.map((clue, idx) => (
          <Pressable
            key={idx}
            style={[styles.clueCard, selectedClue === idx && styles.clueCardActive]}
            onPress={() => setSelectedClue(selectedClue === idx ? null : idx)}
          >
            <Text style={styles.clueTitle}>{clue.title}</Text>
            {selectedClue === idx && <Text style={styles.clueDetail}>{clue.detail}</Text>}
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionHeader}>Interrogate Suspects</Text>
      <View style={styles.suspectList}>
        {suspects.map((s, idx) => (
          <View key={idx} style={styles.suspectCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.suspectName}>{s.name}</Text>
              <Text style={styles.suspectAlibi}>{s.alibi}</Text>
            </View>
            <Pressable
              style={styles.accuseBtn}
              onPress={() => handleAccusation(s)}
            >
              <Text style={styles.accuseBtnText}>Accuse</Text>
            </Pressable>
          </View>
        ))}
      </View>

      {/* Win Modal */}
      <Modal visible={isWon} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalKicker}>CASE SOLVED</Text>
            <Text style={styles.modalTitle}>Elementary!</Text>
            <Text style={styles.modalBody}>
              Dr. Vance claimed to have walked across the storm at 10:40 PM, yet his umbrella and coat were bone dry! He had arrived hours earlier and was hiding inside the archive.
            </Text>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardText}>+35 XP · Detective Rank Boost</Text>
            </View>
            {isSaving ? (
              <ActivityIndicator color={C.primary} style={{ marginTop: 16 }} />
            ) : (
              <Button title="Claim XP & Return" onPress={handleClaim} variant="dark" style={{ marginTop: 18 }} />
            )}
          </View>
        </View>
      </Modal>

      {/* Fail Modal */}
      <Modal visible={isFailed} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalKicker, { color: C.red }]}>INCORRECT DEDUCTION</Text>
            <Text style={styles.modalTitle}>Alibi Confirmed</Text>
            <Text style={styles.modalBody}>
              {accused}’s alibi holds up against the timeline and physical evidence. Look closely at the weather contradiction in the other statements!
            </Text>
            <Button
              title="Review Evidence"
              onPress={() => setIsFailed(false)}
              variant="dark"
              style={{ marginTop: 18 }}
            />
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
    padding: 18,
    borderWidth: 1,
    borderColor: C.line,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: C.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
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
  briefCard: {
    backgroundColor: C.dark,
    borderRadius: R.lg,
    padding: 14,
    marginBottom: 14,
  },
  briefKicker: {
    color: '#93C5FD',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  briefText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  sectionHeader: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 8,
  },
  clueList: {
    gap: 8,
    marginBottom: 14,
  },
  clueCard: {
    backgroundColor: C.bg,
    borderRadius: R.md,
    padding: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  clueCardActive: {
    backgroundColor: C.primarySoft,
    borderColor: '#C7D2FE',
  },
  clueTitle: {
    color: C.text,
    fontSize: 12,
    fontWeight: '800',
  },
  clueDetail: {
    color: C.ink,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    fontStyle: 'italic',
  },
  suspectList: {
    gap: 8,
  },
  suspectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: R.md,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: C.line,
  },
  suspectName: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  suspectAlibi: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  accuseBtn: {
    backgroundColor: C.dark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  accuseBtnText: {
    color: '#FFFFFF',
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
    color: C.green,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalTitle: {
    color: C.ink,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
  },
  modalBody: {
    color: C.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
  },
  rewardBadge: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    marginTop: 14,
  },
  rewardText: {
    color: C.green,
    fontSize: 12,
    fontWeight: '800',
  },
});
