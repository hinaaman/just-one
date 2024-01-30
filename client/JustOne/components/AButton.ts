const aButtonTemplate = document.createElement("template");
aButtonTemplate.innerHTML = `
    <style>
      .button {
        font-family: 'Space Mono', monospace;
        min-width: 200px;
        height: 40px;
        border-radius: 10px;
        border: 1px solid black;
        cursor: pointer;
      }
    </style>
    <button class="button">
        <slot name="text"></span>
    </button>
`;

export class AButton extends HTMLElement {
  buttonElement: HTMLButtonElement;
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(aButtonTemplate.content.cloneNode(true));

    this.buttonElement = this.shadowRoot.querySelector(".button");
  }

  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
  }

}

customElements.define("a-button", AButton);
