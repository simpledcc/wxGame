import type { WordItem } from "./GameTypes";

export interface StudySessionState {
  index: number;
  showMeaning: boolean;
  revealCurrentMeaning: boolean;
}

export interface StudyCard {
  index: number;
  total: number;
  word: string;
  meaning: string;
  meaningVisible: boolean;
}

export function createStudySession(
  words: WordItem[],
  options: Partial<StudySessionState> = {}
): StudySessionState {
  return {
    index: clampIndex(words, options.index ?? 0),
    showMeaning: options.showMeaning ?? true,
    revealCurrentMeaning: false
  };
}

export function getStudyCard(
  words: WordItem[],
  session: StudySessionState
): StudyCard | null {
  if (!words.length) {
    return null;
  }
  const index = clampIndex(words, session.index);
  const item = words[index];
  return {
    index,
    total: words.length,
    word: item.word,
    meaning: item.meaning,
    meaningVisible: session.showMeaning || session.revealCurrentMeaning
  };
}

export function setStudyMeaningVisibility(
  session: StudySessionState,
  showMeaning: boolean
): StudySessionState {
  return {
    ...session,
    showMeaning,
    revealCurrentMeaning: false
  };
}

export function revealCurrentStudyMeaning(session: StudySessionState): StudySessionState {
  return {
    ...session,
    revealCurrentMeaning: true
  };
}

export function moveStudyWord(
  words: WordItem[],
  session: StudySessionState,
  delta: number
): StudySessionState {
  if (!words.length) {
    return createStudySession(words, session);
  }
  const nextIndex = (clampIndex(words, session.index) + delta + words.length) % words.length;
  return {
    ...session,
    index: nextIndex,
    revealCurrentMeaning: false
  };
}

export function shuffleStudyWord(
  words: WordItem[],
  session: StudySessionState,
  random = Math.random
): StudySessionState {
  if (words.length <= 1) {
    return {
      ...session,
      index: 0,
      revealCurrentMeaning: false
    };
  }
  const current = clampIndex(words, session.index);
  let nextIndex = current;
  let attempts = 0;
  while (nextIndex === current && attempts < 8) {
    nextIndex = Math.floor(random() * words.length);
    attempts += 1;
  }
  if (nextIndex === current) {
    nextIndex = (current + 1) % words.length;
  }
  return {
    ...session,
    index: nextIndex,
    revealCurrentMeaning: false
  };
}

function clampIndex(words: WordItem[], index: number): number {
  if (!words.length) {
    return 0;
  }
  return Math.max(0, Math.min(Math.floor(index), words.length - 1));
}
