const AInputTemplate = document.createElement("template");
AInputTemplate.innerHTML = `
    <style>
        .input-name input {
            font-size: 1.2rem;
            font-family: 'Eczar', serif;
        }
    </style>
    <section class="input-name">
        <label for="input"></label>
        <input id="input" type="text" />
    </section>
`;

export class AInput extends HTMLElement {
  inputElement: HTMLInputElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(AInputTemplate.content.cloneNode(true));

    this.inputElement = this.shadowRoot.querySelector("input");
  }

  static get observedAttributes() {
    return ["label", "name"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "label") {
      const labelElement = this.shadowRoot.querySelector("label");
      labelElement.textContent = newValue;
    } else if (name === "name") {
      this.inputElement.setAttribute("name", newValue);
      this.inputElement.id = newValue;
    }
  }

  connectedCallback() {
    this.inputElement.addEventListener("input", () => {
      this.dispatchEvent(
        new CustomEvent("inputValueChange", {
          bubbles: true,
          composed: true,
          detail: { value: this.inputElement.value },
        })
      );
    });
  }

  get value() {
    return this.inputElement.value;
  }

  set value(newValue) {
    this.inputElement.value = newValue;
  }
}

customElements.define("a-input", AInput);
