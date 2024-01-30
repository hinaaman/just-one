const playerTemplate = document.createElement("template");
playerTemplate.innerHTML = `
    <style>
      :host {
        display: block;
        height: 200px;
        border: 1px solid black;
        padding: 10px;
        position: relative;
      }
      :host([data-selected="true"]) {
        background: #f5f5f5;
        border: 2px solid black;
      }
      :host([data-selected="true"])::after {
        content: "✓";
        position: absolute;
        right: 20px;
      }
    </style>
    <slot name="name"></span>
`;

export class BotPlayer extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(playerTemplate.content.cloneNode(true));
  }

  toggleSelection() {
    const isSelected = this.getAttribute("data-selected") === "true";
    this.setAttribute("data-selected", isSelected ? "false" : "true");
  }

  getIsSelected() {
    return this.getAttribute("data-selected") === "true";
  }
}

customElements.define("bot-player", BotPlayer);
