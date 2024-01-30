var M=document.createElement("template");M.innerHTML=`
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
`;class W extends HTMLElement{inputElement;constructor(){super();this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(M.content.cloneNode(!0)),this.inputElement=this.shadowRoot.querySelector("input")}static get observedAttributes(){return["label","name"]}attributeChangedCallback(c,f,R){if(c==="label"){const h=this.shadowRoot.querySelector("label");h.textContent=R}else if(c==="name")this.inputElement.setAttribute("name",R),this.inputElement.id=R}connectedCallback(){this.inputElement.addEventListener("input",()=>{this.dispatchEvent(new CustomEvent("inputValueChange",{bubbles:!0,composed:!0,detail:{value:this.inputElement.value}}))})}get value(){return this.inputElement.value}set value(c){this.inputElement.value=c}}customElements.define("a-input",W);var j=document.createElement("template");j.innerHTML=`
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
        content: "\u2713";
        position: absolute;
        right: 20px;
      }
    </style>
    <slot name="name"></span>
`;class k extends HTMLElement{constructor(){super();this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(j.content.cloneNode(!0))}toggleSelection(){const c=this.getAttribute("data-selected")==="true";this.setAttribute("data-selected",c?"false":"true")}getIsSelected(){return this.getAttribute("data-selected")==="true"}}customElements.define("bot-player",k);var Z=document.createElement("template");Z.innerHTML=`
    <style>
      .player-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        grid-gap: 20px;
      }
    </style>
    <div id="player-list" class="player-list"></div>
`;class _ extends HTMLElement{playerListDiv;players;max;currentPlayersCount;constructor(){super();this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(Z.content.cloneNode(!0));const c=this.getAttribute("data-players")||"";this.players=c.split(","),this.currentPlayersCount=0,this.max=parseInt(this.getAttribute("data-max")||"3",10),this.playerListDiv=this.shadowRoot.querySelector("#player-list"),this.renderPlayers()}renderPlayers(){const c=this.players.map((f)=>{return`<bot-player data-id="${f}"><span slot="name">${f}</span></bot-player>`}).join("");this.playerListDiv.innerHTML=c}getSelectedPlayers(){return Array.from(this.shadowRoot.querySelectorAll('bot-player[data-selected="true"]')).map((f)=>f.getAttribute("data-id"))}connectedCallback(){this.playerListDiv.addEventListener("click",(c)=>{if(c.target instanceof k){const f=c.target;if(f.getIsSelected()){f.toggleSelection(),this.currentPlayersCount--;return}if(this.currentPlayersCount<this.max)f.toggleSelection(),this.currentPlayersCount++}})}}customElements.define("player-list",_);var U=document.createElement("template");U.innerHTML=`
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
`;class i extends HTMLElement{buttonElement;constructor(){super();this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(U.content.cloneNode(!0)),this.buttonElement=this.shadowRoot.querySelector(".button")}connectedCallback(){if(!this.hasAttribute("role"))this.setAttribute("role","button")}}customElements.define("a-button",i);class E{baseUrl;paths;constructor(c){this.baseUrl=c,this.paths={getDeck:"/api/mystery-words",getHint:"/api/hint",getGuess:"/api/guess",getAudit:"/api/audit"}}async handleResponse(c){if(!c.ok)throw new Error(`Request failed with status ${c.status}`);return c.json()}async fetchJson(c,f){try{const R=f?`${this.baseUrl}${c}?${f}`:`${this.baseUrl}${c}`,h=await fetch(R);return this.handleResponse(h)}catch(R){throw new Error(`Request failed: ${R}`)}}async getDeck(){return(await this.fetchJson(this.paths.getDeck)).data}async getHint(c,f){const R=new URLSearchParams({word:c,person:f}),h=await this.fetchJson(this.paths.getHint,R);return console.log(`${f}'s hint: ${h.data}`),h.data}async getAudit(c){const f=new URLSearchParams({hints:c});return(await this.fetchJson(this.paths.getAudit,f)).data}async getGuess(c,f){const R=new URLSearchParams({hints:c,person:f});return(await this.fetchJson(this.paths.getGuess,R)).data}}var O;(function(K){K["LOAD_MYSTERY_WORDS"]="load-mystery-words";K["CHOOSE_MYSTERY_WORD"]="choose-mystery-word";K["COLLECT_HINTS"]="collect-hints";K["AUDIT_HINTS"]="audit-hints";K["GUESS_WORD"]="guess-word";K["CHECK_RESULT"]="check-result";K["GAME_END"]="game-end"})(O||(O={}));var I=Object.freeze({HUMAN_GUESSED:"human-guessed",HUMAN_HINTED:"human-hinted",BOT_GUESSED:"bot-guessed",BOT_HINTED:"bot-hinted"});class H{players;stateGenerator;currentState;deck;successCount;mysteryWord;guesser;guessHistory;hintsHistory;auditedHintsHistory;api;stateChangeCallback;constructor(c,f){this.players=c,this.stateGenerator=this.generateState(),this.guesser=-1,this.successCount=0,this.guessHistory=[],this.hintsHistory=[],this.auditedHintsHistory=[],this.api=new E("http://localhost:3000"),this.stateChangeCallback=f,this.nextState()}*generateState(){yield O.LOAD_MYSTERY_WORDS;while(!this.isGameEndReached())yield O.CHOOSE_MYSTERY_WORD,yield O.COLLECT_HINTS,yield O.AUDIT_HINTS,yield O.GUESS_WORD,yield O.CHECK_RESULT;if(this.isGameEndReached())yield O.GAME_END}getCurrentState(){return this.currentState}isGameEndReached(){return this.deck?.length===0}setNextGuesser(){const c=this.guesser+1;this.guesser=c===this.players.length?0:c}nextState(){const c=this.stateGenerator.next().value;if(c===O.CHOOSE_MYSTERY_WORD)this.setNextGuesser(),this.setMysteryWord();this.currentState=c,this.stateChangeCallback(c)}setMysteryWord(){this.mysteryWord=this.deck.pop()}getMysteryWord(){return this.mysteryWord}getGuesser(){return this.players[this.guesser]}getPlayersHinting(){return this.players.filter((c,f)=>f!==this.guesser)}processGuess(c){if(console.log("processing guess",c),this.guessHistory.push([this.mysteryWord,c]),this.mysteryWord===c)this.successCount++;else if(this.deck.length>0)this.deck.pop();else this.successCount--}getLastGuess(){return this.guessHistory[this.guessHistory.length-1]}getLastHints(){return this.hintsHistory[this.hintsHistory.length-1]}getLastAuditedHints(){return this.auditedHintsHistory[this.auditedHintsHistory.length-1]}getScore(){return this.successCount}async runGame(){let c=this.getCurrentState();while(c!==O.GAME_END){if(typeof c==="undefined")throw Error("State is undefined");if(c===O.LOAD_MYSTERY_WORDS)await this.loadMysteryWords();if(c===O.CHOOSE_MYSTERY_WORD){const f=this.getGuesser()}if(c===O.COLLECT_HINTS){const R=this.getPlayersHinting().map((h)=>h.name).join(", ");await this.receiveHints()}if(c===O.AUDIT_HINTS)await this.auditHints();if(c===O.GUESS_WORD){const f=this.getGuesser();await this.guess(this)}if(c===O.CHECK_RESULT)await this.checkGuessResults();this.nextState(),c=this.getCurrentState()}}async loadMysteryWords(){const c=await this.api.getDeck()||"";this.deck=c.split(",").map((f)=>f.trim())}async auditHints(){const c=this.getLastHints(),R=(await this.api.getAudit(c.join(","))||[]).split(",").map((h)=>h.toLowerCase().trim());this.auditedHintsHistory.push(R)}async checkGuessResults(){await new Promise((f)=>{setTimeout(()=>f("done"),3000)})}async guess(c){const f=this.getGuesser();if(c.getGuesser().isHuman){const h=await this.getPromiseFromEvent(I.HUMAN_GUESSED);c.processGuess(h)}else{const R=this.getLastAuditedHints().join(","),h=await this.api.getGuess(R,f.name)||"";c.processGuess(h)}}async receiveHints(){const c=[];if(this.getPlayersHinting().filter((q)=>!q.isHuman).forEach((q)=>{c.push(this.api.getHint(this.mysteryWord,q.name))}),this.getPlayersHinting().some((q)=>q.isHuman)){const q=this.getPromiseFromEvent(I.HUMAN_HINTED);c.push(q)}const h=await Promise.all(c);this.hintsHistory.push(h)}getPromiseFromEvent(c){return new Promise((f)=>{const R=(h)=>{document.removeEventListener(c,R),f(h.detail.data)};document.addEventListener(c,R)})}}class v{name;isHuman;constructor(c,f){this.name=c,this.isHuman=f}}var P=document.createElement("template");P.innerHTML=`
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
`;class u extends HTMLElement{playerListElement;game;currentSection;progressSection;provideHintSection;guessWordSection;displayGuesserElement;displayGuessWordElement;displayHintElement;startGameButton;submitGuessButton;submitHintButton;userNameElement;guessElement;hintElement;constructor(){super();this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(P.content.cloneNode(!0)),this.playerListElement=this.shadowRoot.querySelector("#player-list"),this.currentSection=this.shadowRoot.querySelector("#start-screen"),this.progressSection=this.shadowRoot.querySelector("#progress-update"),this.provideHintSection=this.shadowRoot.querySelector("#provide-hint"),this.guessWordSection=this.shadowRoot.querySelector("#guess-word"),this.displayGuesserElement=this.shadowRoot.querySelector("#guesser-name"),this.displayGuessWordElement=this.shadowRoot.querySelector("#mystery-word"),this.displayHintElement=this.shadowRoot.querySelector("#hint-list"),this.startGameButton=this.shadowRoot.querySelector("#start-game"),this.submitGuessButton=this.shadowRoot.querySelector("#submit-guess"),this.submitHintButton=this.shadowRoot.querySelector("#submit-hint"),this.userNameElement=this.shadowRoot.querySelector("#user-name"),this.guessElement=this.shadowRoot.querySelector("#guess"),this.hintElement=this.shadowRoot.querySelector("#hint")}connectedCallback(){this.startGameButton.addEventListener("click",async(c)=>{if(!this.game)await this.startGame();else console.info("Game is already running")}),this.submitGuessButton.addEventListener("click",async(c)=>{document.dispatchEvent(new CustomEvent(I.HUMAN_GUESSED,{detail:{data:this.guessElement.value}})),this.guessElement.value=""}),this.submitHintButton.addEventListener("click",async(c)=>{document.dispatchEvent(new CustomEvent(I.HUMAN_HINTED,{detail:{data:this.hintElement.value}})),this.hintElement.value=""})}startGame(){const c=this.userNameElement.value||"You",f=new v(c,!0),R=this.playerListElement.getSelectedPlayers().map((q)=>new v(q,!1)),h=[f,...R];this.game=new H(h,(q)=>this.handleStateChange(q)),this.game.runGame()}handleStateChange(c){switch(c){case O.LOAD_MYSTERY_WORDS:this.showMysteryWordLoadSection();break;case O.CHOOSE_MYSTERY_WORD:this.showMysteryWordSelectionSection();break;case O.COLLECT_HINTS:this.showWaitForHintSection();break;case O.AUDIT_HINTS:this.showAuditHintsSection();break;case O.GUESS_WORD:this.showGuessWordSection();break;case O.CHECK_RESULT:this.showGuessResultSection();break;case O.GAME_END:this.showGameEndSection();break;default:break}}hideCurrentSection(){this.currentSection.classList.add("hide")}showMysteryWordLoadSection(){this.hideCurrentSection(),this.progressSection.textContent="Initializing game, please wait...",this.progressSection.classList.remove("hide"),this.currentSection=this.progressSection}showMysteryWordSelectionSection(){this.hideCurrentSection(),this.progressSection.textContent="Selecting a mystery word...",this.progressSection.classList.remove("hide"),this.currentSection=this.progressSection}showWaitForHintSection(){this.hideCurrentSection();const c=this.game.getGuesser();if(c.isHuman)this.progressSection.textContent="It's your turn to guess! Gathering hints from other players...",this.progressSection.classList.remove("hide"),this.currentSection=this.progressSection;else this.displayGuessWordElement.textContent=this.game.getMysteryWord(),this.displayGuesserElement.textContent=c.name,this.provideHintSection.classList.remove("hide"),this.currentSection=this.provideHintSection}showAuditHintsSection(){this.hideCurrentSection(),this.progressSection.textContent="Removing duplicate hints....",this.progressSection.classList.remove("hide"),this.currentSection=this.progressSection}showGuessWordSection(){this.hideCurrentSection();const c=this.game.getGuesser();if(c.isHuman){const R=(this.game.getLastAuditedHints()||[]).map((h)=>`<div class='hint'>${h}</div>`).join("");this.displayHintElement.innerHTML=R,this.guessWordSection.classList.remove("hide"),this.currentSection=this.guessWordSection}else this.progressSection.textContent=`Waiting for ${c.name} to guess!`,this.progressSection.classList.remove("hide"),this.currentSection=this.progressSection}showGuessResultSection(){this.hideCurrentSection();const c=this.game.getGuesser();console.log(" this.game.getLastGuess()",this.game.getLastGuess());const[f,R]=this.game.getLastGuess(),h=c.isHuman?"You":c.name,z=f===R?"Well done! :D":"Oh no :(";this.progressSection.innerHTML=`<div>Mystery word for this turn was <strong>${f}</strong>. <strong>${h}</strong> guessed <strong>${R}</strong>. ${z}</div>`,this.progressSection.classList.remove("hide"),this.currentSection=this.progressSection}showGameEndSection(){this.hideCurrentSection();const c=this.game.getScore();this.progressSection.textContent=`Game ended! You and the team scored ${c}.`,this.progressSection.classList.remove("hide"),this.currentSection=this.progressSection}}customElements.define("just-one",u);var S=document.getElementById("main"),m=document.createElement("just-one");S.appendChild(m);
