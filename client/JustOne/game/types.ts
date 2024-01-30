export enum State {
  LOAD_MYSTERY_WORDS = "load-mystery-words",
  CHOOSE_MYSTERY_WORD = "choose-mystery-word",
  COLLECT_HINTS = "collect-hints",
  AUDIT_HINTS = "audit-hints",
  GUESS_WORD = "guess-word",
  CHECK_RESULT = "check-result",
  GAME_END = "game-end",
}

export const EVENTS = Object.freeze({
  HUMAN_GUESSED: "human-guessed",
  HUMAN_HINTED: "human-hinted",
  BOT_GUESSED: "bot-guessed",
  BOT_HINTED: "bot-hinted",
});

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];
