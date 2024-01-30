import { Api } from "../api";
import { EVENTS, EventType, State } from "../types";
import { Player } from "./Player";

export class GameState {
  private players: Player[];
  private stateGenerator: Generator<State>;
  private currentState: State;
  private deck: string[];
  private successCount: number;
  private mysteryWord: string;
  private guesser: number;
  private guessHistory: [string, string][];
  private hintsHistory: string[][];
  private auditedHintsHistory: string[][];
  private api: Api;
  private stateChangeCallback: (currentState: State) => void;

  constructor(
    players: Player[],
    stateChangeCallback: (currentState: State) => void
  ) {
    this.players = players;
    this.stateGenerator = this.generateState();
    this.guesser = -1;
    this.successCount = 0;
    this.guessHistory = [];
    this.hintsHistory = [];
    this.auditedHintsHistory = [];
    this.api = new Api("http://localhost:3000");
    this.stateChangeCallback = stateChangeCallback;
    this.nextState();
  }

  *generateState() {
    yield State.LOAD_MYSTERY_WORDS;
    while (!this.isGameEndReached()) {
      yield State.CHOOSE_MYSTERY_WORD;
      yield State.COLLECT_HINTS;
      yield State.AUDIT_HINTS;
      yield State.GUESS_WORD;
      yield State.CHECK_RESULT;
    }
    if (this.isGameEndReached()) {
      yield State.GAME_END;
    }
  }

  getCurrentState() {
    return this.currentState;
  }

  isGameEndReached() {
    return this.deck?.length === 0;
  }

  setNextGuesser() {
    const next = this.guesser + 1;
    this.guesser = next === this.players.length ? 0 : next;
  }

  nextState() {
    const nextState = this.stateGenerator.next().value as State;

    if (nextState === State.CHOOSE_MYSTERY_WORD) {
      this.setNextGuesser();
      this.setMysteryWord();
    }

    this.currentState = nextState;
    this.stateChangeCallback(nextState);
  }

  setMysteryWord() {
    this.mysteryWord = this.deck.pop();
  }

  getMysteryWord() {
    return this.mysteryWord;
  }

  getGuesser() {
    return this.players[this.guesser];
  }

  getPlayersHinting() {
    return this.players.filter((player, index) => index !== this.guesser);
  }

  processGuess(guess: string) {
    console.log("processing guess", guess);
    this.guessHistory.push([this.mysteryWord, guess]);
    if (this.mysteryWord === guess) {
      this.successCount++;
    } else {
      if (this.deck.length > 0) {
        // Remove an extra card from deck
        this.deck.pop();
      } else {
        // Or lose a successful guess
        this.successCount--;
      }
    }
  }

  getLastGuess() {
    return this.guessHistory[this.guessHistory.length - 1];
  }

  getLastHints() {
    return this.hintsHistory[this.hintsHistory.length - 1];
  }

  getLastAuditedHints() {
    return this.auditedHintsHistory[this.auditedHintsHistory.length - 1];
  }

  getScore() {
    return this.successCount;
  }

  async runGame() {
    let state = this.getCurrentState();

    while (state !== State.GAME_END) {
      if (typeof state === "undefined") {
        throw Error("State is undefined");
      }

      if (state === State.LOAD_MYSTERY_WORDS) {
        await this.loadMysteryWords();
      }

      if (state === State.CHOOSE_MYSTERY_WORD) {
        const guesser = this.getGuesser();

        //await this.selectMysteryWord();
      }

      if (state === State.COLLECT_HINTS) {
        const hinters = this.getPlayersHinting();
        const names = hinters.map((player) => player.name).join(", ");

        // Receive hints
        await this.receiveHints();
      }

      if (state === State.AUDIT_HINTS) {
        // Process audit
        await this.auditHints();
      }

      if (state === State.GUESS_WORD) {
        const guesser = this.getGuesser();

        // Process guess
        await this.guess(this);
      }

      if (state === State.CHECK_RESULT) {
        // Process guess
        await this.checkGuessResults();
      }

      this.nextState();
      state = this.getCurrentState();
    }
  }

  // States
  async loadMysteryWords() {
    const mysterWords = (await this.api.getDeck()) || "";
    this.deck = mysterWords.split(",").map((word: string) => word.trim());
  }

  /*async selectMysteryWord() {
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }*/

  async auditHints() {
    const hints = this.getLastHints();
    const uniqueHints = (await this.api.getAudit(hints.join(","))) || [];

    const cleanedList = uniqueHints
      .split(",")
      .map((w: string) => w.toLowerCase().trim());

    this.auditedHintsHistory.push(cleanedList);
  }

  async checkGuessResults() {
    const waitForABit = new Promise((resolve) => {
      setTimeout(() => resolve("done"), 3000);
    });

    await waitForABit;
  }

  async guess(game: GameState) {
    const guesser = this.getGuesser();
    if (game.getGuesser().isHuman) {
      const promiseFromHuman = this.getPromiseFromEvent(EVENTS.HUMAN_GUESSED);
      const data: any = await promiseFromHuman;

      game.processGuess(data);
    } else {
      const hintsForBot = this.getLastAuditedHints().join(",");
      const botGuess =
        (await this.api.getGuess(hintsForBot, guesser.name)) || "";

      game.processGuess(botGuess);
    }
  }

  async receiveHints() {
    const promisedHintList: Promise<any>[] = [];
    const botPlayers = this.getPlayersHinting().filter(
      (player) => !player.isHuman
    );

    botPlayers.forEach((p) => {
      promisedHintList.push(this.api.getHint(this.mysteryWord, p.name));
    });

    const isAHumanHinting = this.getPlayersHinting().some((p) => p.isHuman);

    if (isAHumanHinting) {
      const promiseFromHuman = this.getPromiseFromEvent(EVENTS.HUMAN_HINTED);
      promisedHintList.push(promiseFromHuman);
    }

    const hints = await Promise.all(promisedHintList);

    this.hintsHistory.push(hints);
  }

  getPromiseFromEvent(event: EventType) {
    return new Promise((resolve) => {
      const listener = (customEvent: any) => {
        document.removeEventListener(event, listener);
        resolve(customEvent.detail.data);
      };
      document.addEventListener(event, listener);
    });
  }
}
