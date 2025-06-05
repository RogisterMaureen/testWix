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
            font-family: "Segoe UI", sans-serif;
          }

          .emoji-button {
            cursor: pointer;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
            padding: 12px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border: none;
            font-size: 32px;
            color: white;
          }

          .emoji-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
          }

          .chatbox {
            display: flex;
            flex-direction: column;
            position: absolute;
            bottom: 60px;
            width: 320px;
            height: 420px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
          }

          .chatbox.open {
            opacity: 1;
            pointer-events: all;
            transform: translateY(0);
          }

          .chat-header {
            background: #4f46e5;
            color: white;
            padding: 12px;
            font-weight: bold;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
            font-size: 16px;
          }

          .chat-messages {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
            font-size: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .message {
            background: #f1f1f1;
            padding: 10px 14px;
            border-radius: 20px;
            max-width: 80%;
            word-wrap: break-word;
          }

          .message.user {
            align-self: flex-end;
            background: #4f46e5;
            color: white;
          }

          .chat-input {
            display: flex;
            border-top: 1px solid #eee;
          }

          .chat-input input {
            flex: 1;
            border: none;
            padding: 12px;
            font-size: 14px;
            outline: none;
            border-bottom-left-radius: 16px;
          }

          .chat-input button {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 12px 18px;
            cursor: pointer;
            border-bottom-right-radius: 16px;
          }
        </style>

        <div class="chat-widget">
          <button class="emoji-button">💬</button>
          <div class="chatbox">
            <div class="chat-header">Chat Assistant</div>
            <div class="chat-messages">
              <div class="message">Bonjour ! Comment puis-je vous aider ?</div>
            </div>
            <div class="chat-input">
              <input type="text" placeholder="Tapez votre message..." />
              <button>Envoyer</button>
            </div>
          </div>
        </div>

        <audio id="openSound" src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="></audio>
        <audio id="sendSound" src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="></audio>
        <audio id="receiveSound" src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="></audio>
      `;

      this.shadowRoot.appendChild(container);

      this.emojiButton = this.shadowRoot.querySelector(".emoji-button");
      this.chatbox = this.shadowRoot.querySelector(".chatbox");
      this.input = this.shadowRoot.querySelector("input");
      this.sendButton = this.shadowRoot.querySelector(".chat-input button");
      this.messages = this.shadowRoot.querySelector(".chat-messages");

      // 🔊 Sons
      this.openSound = this.shadowRoot.getElementById("openSound");
      this.sendSound = this.shadowRoot.getElementById("sendSound");
      this.receiveSound = this.shadowRoot.getElementById("receiveSound");

      // 🧭 Position & taille
      this.updatePosition(position);
      this.updateSize(size);

      // 📦 Toggle chatbox
      this.emojiButton.addEventListener("click", () => {
        const isOpen = this.chatbox.classList.toggle("open");
        if (isOpen) {
          this.openSound.play();
          this.chatIcon.style.display = "none";
          this.closeIcon.style.display = "inline";
        } else {
          this.chatIcon.style.display = "inline";
          this.closeIcon.style.display = "none";
        }
      });

      // 🎯 Envoi message
      this.sendButton.addEventListener("click", () => this.handleMessage());
      this.input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleMessage();
      });

      // ✨ Close on outside click
      this.boundHandleOutsideClick = this.handleOutsideClick.bind(this);
      this.shadowRoot.ownerDocument.addEventListener('click', this.boundHandleOutsideClick);
    }

    disconnectedCallback() {
      this.shadowRoot.ownerDocument.removeEventListener('click', this.boundHandleOutsideClick);
    }

    handleOutsideClick(event) {
      if (!this.chatbox.classList.contains('open')) {
        return; // Do nothing if the chatbox is already closed
      }

      const clickedInsideWidget = event.composedPath().includes(this.shadowRoot.querySelector('.chat-widget'));
      
      if (!clickedInsideWidget) {
        this.chatbox.classList.remove('open');
        this.chatIcon.style.display = "inline";
        this.closeIcon.style.display = "none";
        // Optionally play a close sound here if desired
      }
    }

    updatePosition(position) {
      const widget = this.shadowRoot.querySelector(".chat-widget");
      const chatbox = this.shadowRoot.querySelector(".chatbox");
      if (!widget) return;

      if (position === "left") {
        widget.style.left = "20px";
        widget.style.right = "auto";
        chatbox.style.left = "20px";
        chatbox.style.right = "auto";
      } else {
        widget.style.right = "20px";
        widget.style.left = "auto";
        chatbox.style.right = "20px";
        chatbox.style.left = "auto";
      }
    }

    updateSize(size) {
      if (!this.emojiButton) return;

      const sizes = {
        small: "24px",
        medium: "32px",
        large: "48px",
      };
      this.emojiButton.style.fontSize = sizes[size] || sizes.medium;
    }

    handleMessage() {
      const text = this.input.value.trim();
      if (!text) return;

      this.addMessage(text, "user");
      this.input.value = "";
      this.sendSound.play();

      setTimeout(() => {
        const response = this.getAutoReply(text);
        this.addMessage(response, "bot");
        this.receiveSound.play();
      }, 600);
    }

    addMessage(content, type = "bot") {
      const msg = document.createElement("div");
      msg.className = `message ${type}`;
      msg.textContent = content;
      this.messages.appendChild(msg);
      this.messages.scrollTop = this.messages.scrollHeight;
    }

    getAutoReply(userText) {
      const lower = userText.toLowerCase();
      if (lower.includes("prix") || lower.includes("tarif")) return "Nos prix varient selon les options choisies. 😊";
      if (lower.includes("bonjour") || lower.includes("salut")) return "Bonjour à vous ! Comment puis-je aider ?";
      if (lower.includes("aide") || lower.includes("support")) return "Je suis là pour vous aider. Dites-m'en plus.";
      return "Je suis désolé, je ne comprends pas encore cela. 🤖";
    }
  }

  customElements.define("hello-world", HelloWorld);
}
