import "./BotPlayer";
import { BotPlayer } from "./BotPlayer";

const playerListTemplate = document.createElement("template");
playerListTemplate.innerHTML = `
    <style>
      .player-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        grid-gap: 20px;
      }
    </style>
    <div id="player-list" class="player-list"></div>
`;

export class PlayerList extends HTMLElement {
  playerListDiv: HTMLElement;
  players: string[];
  max: number;
  currentPlayersCount: number;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(playerListTemplate.content.cloneNode(true));

    const playersData = this.getAttribute("data-players") || "";
    this.players = playersData.split(",");
    this.currentPlayersCount = 0;
    this.max = parseInt(this.getAttribute("data-max") || "3", 10);

    this.playerListDiv = this.shadowRoot.querySelector("#player-list");
    this.renderPlayers();
  }

  renderPlayers() {
    const playersTemplate = this.players
      .map((player) => {
        return `<bot-player data-id="${player}"><span slot="name">${player}</span></bot-player>`;
      })
      .join("");

    this.playerListDiv.innerHTML = playersTemplate;
  }

  getSelectedPlayers() {
    const selectedPlayers = Array.from(
      this.shadowRoot.querySelectorAll('bot-player[data-selected="true"]')
    );
    return selectedPlayers.map((player) => player.getAttribute("data-id"));
  }

  connectedCallback() {
    this.playerListDiv.addEventListener("click", (event) => {
      if (event.target instanceof BotPlayer) {
        const botPlayer = event.target;
        if (botPlayer.getIsSelected()) {
          botPlayer.toggleSelection();
          this.currentPlayersCount--;
          return;
        }

        if (this.currentPlayersCount < this.max) {
          botPlayer.toggleSelection();
          this.currentPlayersCount++;
        }
      }
    });
  }
}

customElements.define("player-list", PlayerList);
