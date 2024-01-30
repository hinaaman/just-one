import "./components/AInput";
import "./components/PlayerList";
import "./components/AButton";

//import { runGame } from "./game";
import { GameState } from "./game/models/GameState";
import { Player } from "./game/models/Player";
import { PlayerList } from "./components/PlayerList";
import { EVENTS, State } from "./game/types";

const template = document.createElement("template");
template.innerHTML = `
    <style>
      :host {
      }
      h1 {
        font-family: 'Space Mono', monospace;
        font-size: 4rem;
      }
      .container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Eczar', serif;
        font-size: 1.2rem;
      }
      .content {
        width: 90vw;
        border-radius: 10px;
        padding: 20px;
        display: grid;
        grid-template-rows: 1fr;
        grid-gap: 20px;
      }
      .hide {
        display: none !important;
      }
      .help-guess {
        display: flex;
        align-items: center;
        grid-gap: 5px;
      }
      .section {
        display: grid;
        grid-gap: 20px;
        width: fit-content;
        padding: 20px;
        margin: 0 auto;
      }
      .hint-list {
        display: flex;
        flex-direction: column;
        grid-gap: 20px;
        margin-bottom: 20px;
      }
      
      .hint {
        border: 1px solid black;
        border-radius: 10px;
        padding: 10px 15px;
      }
      .word {
        font-weight: 400;
      }
    </style>
    <div class="container">
      <h1>Just One</h1>

      <section id="start-screen" class="content">
        <a-input id="user-name" label="Your name:" name="name"></a-input>
        <player-list id="player-list" data-players="Ursula K. Le Guin,Socrates,Arundhati Roy,Shakespeare,Leslie Knope,Yoda,Gandalf" data-max="3"></player-list>
        <a-button id="start-game"><span slot="text">Start Game</span></a-button>
      </section>

      <section id="provide-hint" class="section provide-hint hide">
        <div class="help-guess">
            <p>Help <strong><span id="guesser-name"></span></strong> guess the word:</p>
            <div id="mystery-word" class="word"></div>
        </div>
        <a-input id="hint" label="Your hint:" name="hint"></a-input>
        <a-button id="submit-hint"><span slot="text">Submit Hint</span></a-button>
      </section>

      <section id="guess-word" class="section guess-word hide">
        <div id="hint-list" class="hint-list">
          <div class="hint">Hint 1</div>
          <div class="hint">Hint 2</div>
          <div class="hint">Hint 3</div>
        </div>
        <a-input id="guess" label="Your guess:" name="guess"></a-input>
        <a-button id="submit-guess"><span slot="text">Submit Guess</span></a-button>
      </section>
        
      <section id="progress-update" class="section hide">
        progress update
      </section>

    </div>
`;

export class JustOne extends HTMLElement {
  private playerListElement: PlayerList;
  private game: GameState;

  // Sections
  private currentSection: HTMLElement;
  private progressSection: HTMLElement;
  private provideHintSection: HTMLElement;
  private guessWordSection: HTMLElement;

  // Placeholders
  private displayGuesserElement: HTMLElement;
  private displayGuessWordElement: HTMLElement;
  private displayHintElement: HTMLElement;

  // Buttons
  private startGameButton: HTMLElement;
  private submitGuessButton: HTMLElement;
  private submitHintButton: HTMLElement;

  // Inputs
  private userNameElement: HTMLInputElement;
  private guessElement: HTMLInputElement;
  private hintElement: HTMLInputElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.playerListElement = this.shadowRoot.querySelector("#player-list");

    // Sections
    this.currentSection = this.shadowRoot.querySelector("#start-screen");
    this.progressSection = this.shadowRoot.querySelector("#progress-update");
    this.provideHintSection = this.shadowRoot.querySelector("#provide-hint");
    this.guessWordSection = this.shadowRoot.querySelector("#guess-word");

    // Placeholders
    this.displayGuesserElement = this.shadowRoot.querySelector("#guesser-name");
    this.displayGuessWordElement =
      this.shadowRoot.querySelector("#mystery-word");
    this.displayHintElement = this.shadowRoot.querySelector("#hint-list");

    // Buttonsx
    this.startGameButton = this.shadowRoot.querySelector("#start-game");
    this.submitGuessButton = this.shadowRoot.querySelector("#submit-guess");
    this.submitHintButton = this.shadowRoot.querySelector("#submit-hint");

    // Inputs
    this.userNameElement = this.shadowRoot.querySelector("#user-name");
    this.guessElement = this.shadowRoot.querySelector("#guess");
    this.hintElement = this.shadowRoot.querySelector("#hint");
  }

  connectedCallback() {
    this.startGameButton.addEventListener("click", async (event) => {
      if (!this.game) {
        await this.startGame();
      } else {
        console.info("Game is already running");
      }
    });

    this.submitGuessButton.addEventListener("click", async (event) => {
      document.dispatchEvent(
        new CustomEvent(EVENTS.HUMAN_GUESSED, {
          detail: {
            data: this.guessElement.value,
          },
        })
      );
      this.guessElement.value = "";
    });

    this.submitHintButton.addEventListener("click", async (event) => {
      document.dispatchEvent(
        new CustomEvent(EVENTS.HUMAN_HINTED, {
          detail: {
            data: this.hintElement.value,
          },
        })
      );
      this.hintElement.value = "";
    });
  }

  startGame() {
    const name = this.userNameElement.value || "You";
    const human = new Player(name, true);

    const bots = this.playerListElement
      .getSelectedPlayers()
      .map((bot) => new Player(bot, false));

    const players = [human, ...bots];

    this.game = new GameState(players, (state) =>
      this.handleStateChange(state)
    );

    this.game.runGame();
    //runGame(this.game);
  }

  handleStateChange(currentState: State) {
    switch (currentState) {
      case State.LOAD_MYSTERY_WORDS:
        this.showMysteryWordLoadSection();
        break;
      case State.CHOOSE_MYSTERY_WORD:
        this.showMysteryWordSelectionSection();
        break;
      case State.COLLECT_HINTS:
        this.showWaitForHintSection();
        break;
      case State.AUDIT_HINTS:
        this.showAuditHintsSection();
        break;
      case State.GUESS_WORD:
        this.showGuessWordSection();
        break;
      case State.CHECK_RESULT:
        this.showGuessResultSection();
        break;
      case State.GAME_END:
        this.showGameEndSection();
        break;
      default:
        break;
    }
  }

  hideCurrentSection() {
    this.currentSection.classList.add("hide");
  }

  showMysteryWordLoadSection() {
    this.hideCurrentSection();
    this.progressSection.textContent = "Initializing game, please wait...";
    this.progressSection.classList.remove("hide");

    this.currentSection = this.progressSection;
  }

  showMysteryWordSelectionSection() {
    this.hideCurrentSection();
    this.progressSection.textContent = "Selecting a mystery word...";
    this.progressSection.classList.remove("hide");
    this.currentSection = this.progressSection;
  }

  showWaitForHintSection() {
    this.hideCurrentSection();
    const currentGuesser = this.game.getGuesser();

    if (currentGuesser.isHuman) {
      this.progressSection.textContent =
        "It's your turn to guess! Gathering hints from other players...";
      this.progressSection.classList.remove("hide");
      this.currentSection = this.progressSection;
    } else {
      this.displayGuessWordElement.textContent = this.game.getMysteryWord();
      this.displayGuesserElement.textContent = currentGuesser.name;
      this.provideHintSection.classList.remove("hide");
      this.currentSection = this.provideHintSection;
    }
  }

  showAuditHintsSection() {
    this.hideCurrentSection();

    this.progressSection.textContent = "Removing duplicate hints....";

    this.progressSection.classList.remove("hide");
    this.currentSection = this.progressSection;
  }

  showGuessWordSection() {
    this.hideCurrentSection();

    const guesser = this.game.getGuesser();

    if (guesser.isHuman) {
      const hints = this.game.getLastAuditedHints() || [];
      const hintsElem = hints
        .map((hint) => `<div class='hint'>${hint}</div>`)
        .join("");

      this.displayHintElement.innerHTML = hintsElem;
      this.guessWordSection.classList.remove("hide");
      this.currentSection = this.guessWordSection;
    } else {
      this.progressSection.textContent = `Waiting for ${guesser.name} to guess!`;
      this.progressSection.classList.remove("hide");

      this.currentSection = this.progressSection;
    }
  }

  showGuessResultSection() {
    this.hideCurrentSection();

    const guesser = this.game.getGuesser();
    console.log(" this.game.getLastGuess()", this.game.getLastGuess());
    const [mystery, guess] = this.game.getLastGuess();
    const player = guesser.isHuman ? "You" : guesser.name;
    const success = mystery === guess;
    const message = success ? "Well done! :D" : "Oh no :(";
    this.progressSection.innerHTML = `<div>Mystery word for this turn was <strong>${mystery}</strong>. <strong>${player}</strong> guessed <strong>${guess}</strong>. ${message}</div>`;

    this.progressSection.classList.remove("hide");

    this.currentSection = this.progressSection;
  }

  showGameEndSection() {
    this.hideCurrentSection();

    const score = this.game.getScore();
    this.progressSection.textContent = `Game ended! You and the team scored ${score}.`;
    this.progressSection.classList.remove("hide");

    this.currentSection = this.progressSection;
  }
}

customElements.define("just-one", JustOne);
