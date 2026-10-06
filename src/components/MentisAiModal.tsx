import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from './Button';
import { C, R } from '../theme';

interface MentisAiModalProps {
  visible: boolean;
  onClose: () => void;
  onStartFocus: () => void;
  onStartBreathing: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  action?: 'focus' | 'breathing';
}

const PRESET_QUESTIONS = [
  'How do I stop doomscrolling before sleep?',
  'Suggest a 5-minute study focus routine',
  'I feel an intense urge to open social media',
  'What is the 20-20-20 eye strain reset?',
];

export function MentisAiModal({
  visible,
  onClose,
  onStartFocus,
  onStartBreathing,
}: MentisAiModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your Mentis AI focus guide. When impulse strikes or your attention wanders, what do you need assistance with right now?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    Haptics.selectionAsync().catch(() => {});

    setTimeout(() => {
      let reply = '';
      let action: 'focus' | 'breathing' | undefined;

      const lower = query.toLowerCase();
      if (lower.includes('sleep') || lower.includes('night') || lower.includes('doomscroll')) {
        reply =
          'Late-night scrolling is driven by bedtime procrastination (seeking reward after an exhausting day). Put your phone in another room or switch screen to greyscale. Try a 2-minute 4-7-8 relaxing breathwork to trigger your parasympathetic nervous system.';
        action = 'breathing';
      } else if (lower.includes('urge') || lower.includes('social') || lower.includes('scroll')) {
        reply =
          'Urge Surfing Protocol: The chemical spike of a dopamine urge peaks at 90 seconds, then drops steeply if not fed. Rather than fighting it, ride it like a wave for 90 seconds while playing a quick Sudoku sprint or 1-minute focus reset.';
        action = 'focus';
      } else if (lower.includes('study') || lower.includes('routine') || lower.includes('pomodoro')) {
        reply =
          'The 25/5 Flow State Formula: Define ONE clear deliverable (e.g. "Draft 3 paragraphs"). Close all irrelevant tabs, start a 15-minute backend focus session, and leave your phone face-down.';
        action = 'focus';
      } else if (lower.includes('20-20-20') || lower.includes('eye')) {
        reply =
          'The 20-20-20 Rule: Every 20 minutes of screen work, look at an object 20 feet away for at least 20 seconds. This relaxes the ciliary muscles in your eyes and resets mental fatigue.';
        action = 'breathing';
      } else {
        reply =
          `I analyzed your focus profile. Remember: willpower is a depletable battery, while friction is your strongest shield. What if you protected just 10 minutes right now before continuing?`;
        action = 'focus';
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply,
          action,
        },
      ]);
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, 600);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>NEURAL FOCUS COPILOT</Text>
              <Text style={styles.title}>Mentis AI Assistant</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Quick chip suggestions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.presetScroll}
          >
            {PRESET_QUESTIONS.map((q, idx) => (
              <Pressable
                key={idx}
                style={styles.presetChip}
                onPress={() => handleSend(q)}
              >
                <Text style={styles.presetText}>{q}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Messages list */}
          <ScrollView style={styles.messagesList} contentContainerStyle={{ gap: 10, paddingVertical: 10 }}>
            {messages.map(m => (
              <View
                key={m.id}
                style={[
                  styles.msgBubble,
                  m.sender === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.msgText,
                    m.sender === 'user' ? styles.userMsgText : styles.aiMsgText,
                  ]}
                >
                  {m.text}
                </Text>
                {m.action && (
                  <View style={styles.actionRow}>
                    {m.action === 'focus' && (
                      <Pressable
                        style={styles.inlineAction}
                        onPress={() => {
                          onClose();
                          onStartFocus();
                        }}
                      >
                        <Text style={styles.inlineActionText}>⚡ Start Suggested Reset →</Text>
                      </Pressable>
                    )}
                    {m.action === 'breathing' && (
                      <Pressable
                        style={styles.inlineAction}
                        onPress={() => {
                          onClose();
                          onStartBreathing();
                        }}
                      >
                        <Text style={styles.inlineActionText}>🧘 Start Zen Breathwork →</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            ))}
            {isTyping && (
              <View style={[styles.msgBubble, styles.aiBubble]}>
                <Text style={styles.aiMsgText}>Mentis AI is thinking…</Text>
              </View>
            )}
          </ScrollView>

          {/* Input row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask Mentis AI anything about attention..."
              placeholderTextColor={C.muted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <Pressable
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!input.trim()}
            >
              <Text style={styles.sendBtnText}>↑</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 23, 38, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '88%',
    minHeight: 520,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 99,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kicker: {
    color: C.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  title: {
    color: C.ink,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
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
  presetScroll: {
    maxHeight: 38,
    marginVertical: 8,
  },
  presetChip: {
    backgroundColor: C.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  presetText: {
    color: C.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  messagesList: {
    flex: 1,
    marginVertical: 8,
  },
  msgBubble: {
    padding: 14,
    borderRadius: R.lg,
    maxWidth: '86%',
  },
  userBubble: {
    backgroundColor: C.dark,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: C.bg,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: C.line,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userMsgText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aiMsgText: {
    color: C.text,
    fontWeight: '600',
  },
  actionRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  inlineAction: {
    backgroundColor: C.primarySoft,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  inlineActionText: {
    color: C.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingTop: 8,
  },
  input: {
    flex: 1,
    minHeight: 46,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: 14,
    fontSize: 13,
    color: C.ink,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});
