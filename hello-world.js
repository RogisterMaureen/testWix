if (!customElements.get("hello-world")) {
  class HelloWorld extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
      return ["position", "size"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.shadowRoot) return;

      if (name === "position") this.updatePosition(newValue);
      if (name === "size") this.updateSize(newValue);
    }

    connectedCallback() {
      const position = this.getAttribute("position") || "right";
      const size = this.getAttribute("size") || "medium";

      const container = document.createElement("div");
      container.innerHTML = `
        <style>
          .chat-widget {
            position: fixed;
            bottom: 20px;
            z-index: 9999;
            font-family: sans-serif;
          }

          .emoji-button {
            cursor: pointer;
            background: white;
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            padding: 8px;
            transition: transform 0.2s ease;
          }

          .emoji-button:hover {
            transform: scale(1.1);
          }

          .chatbox {
            display: none;
            position: absolute;
            bottom: 60px;
            width: 300px;
            height: 400px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
            flex-direction: column;
          }

          .chat-header {
            background: #4f46e5;
            color: white;
            padding: 10px;
            font-weight: bold;
          }

          .chat-messages {
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            font-size: 14px;
          }

          .chat-input {
            display: flex;
            border-top: 1px solid #eee;
          }

          .chat-input input {
            flex: 1;
            border: none;
            padding: 10px;
            font-size: 14px;
            outline: none;
          }

          .chat-input button {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
          }
        </style>

        <div class="chat-widget">
          <div class="emoji-button">💬</div>
          <div class="chatbox">
            <div class="chat-header">Chat</div>
            <div class="chat-messages">
              <div>Bonjour ! Comment puis-je vous aider ?</div>
            </div>
            <div class="chat-input">
              <input type="text" placeholder="Tapez votre message..." />
              <button>Envoyer</button>
            </div>
          </div>
        </div>
      `;

      this.shadowRoot.appendChild(container);

      this.emojiButton = this.shadowRoot.querySelector(".emoji-button");
      this.chatbox = this.shadowRoot.querySelector(".chatbox");
      this.input = this.shadowRoot.querySelector("input");
      this.sendButton = this.shadowRoot.querySelector("button");
      this.messages = this.shadowRoot.querySelector(".chat-messages");

      this.emojiButton.addEventListener("click", () => {
        const isOpen = this.chatbox.style.display === "flex";
        this.chatbox.style.display = isOpen ? "none" : "flex";
      });

      this.sendButton.addEventListener("click", () => {
        const text = this.input.value.trim();
        if (text) {
          const userMsg = document.createElement("div");
          userMsg.textContent = text;
          this.messages.appendChild(userMsg);
          this.input.value = "";
          this.messages.scrollTop = this.messages.scrollHeight;
        }
      });

      this.input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.sendButton.click();
      });

      // Init
      this.updatePosition(position);
      this.updateSize(size);

      // Écoute postMessage pour debug depuis Wix Studio
      window.addEventListener("message", (e) => {
        const { position, size } = e.data || {};
        if (position) this.setAttribute("position", position);
        if (size) this.setAttribute("size", size);
      });
    }

    updatePosition(position) {
      const widget = this.shadowRoot.querySelector(".chat-widget");
      const chatbox = this.shadowRoot.querySelector(".chatbox");

      if (!widget || !chatbox) return;

      widget.style.left = position === "left" ? "20px" : "";
      widget.style.right = position === "right" ? "20px" : "";

      chatbox.style.left = position === "left" ? "0" : "";
      chatbox.style.right = position === "right" ? "0" : "";
    }

    updateSize(size) {
      if (!this.emojiButton) return;
      let fontSize = "32px"; // default medium
      if (size === "small") fontSize = "20px";
      else if (size === "large") fontSize = "48px";

      this.emojiButton.style.fontSize = fontSize;
    }
  }

  customElements.define("hello-world", HelloWorld);
}
