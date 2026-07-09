import type { WordItem } from "../domain/GameTypes";
import {
  createStudySession,
  getStudyCard,
  moveStudyWord,
  revealCurrentStudyMeaning,
  setStudyMeaningVisibility,
  shuffleStudyWord,
  type StudyCard,
  type StudySessionState
} from "../domain/StudySession";

export class StudyStore {
  private session: StudySessionState = createStudySession([]);

  start(words: WordItem[], options: Partial<StudySessionState> = {}): void {
    this.session = createStudySession(words, options);
  }

  getSession(): StudySessionState {
    return { ...this.session };
  }

  getCard(words: WordItem[]): StudyCard | null {
    return getStudyCard(words, this.session);
  }

  setShowMeaning(showMeaning: boolean): void {
    this.session = setStudyMeaningVisibility(this.session, showMeaning);
  }

  revealCurrentMeaning(): void {
    this.session = revealCurrentStudyMeaning(this.session);
  }

  next(words: WordItem[]): void {
    this.session = moveStudyWord(words, this.session, 1);
  }

  previous(words: WordItem[]): void {
    this.session = moveStudyWord(words, this.session, -1);
  }

  shuffle(words: WordItem[], random = Math.random): void {
    this.session = shuffleStudyWord(words, this.session, random);
  }
}
