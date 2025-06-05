if (!customElements.get("hello-world")) {
  class HelloWorld extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.inactivityTimer = null;
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
            font-family: 'Segoe UI', sans-serif;
          }

          .emoji-button {
            cursor: pointer;
            background: white;
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            padding: 8px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            font-size: 32px;
          }

          .emoji-button:hover {
            transform: scale(1.15);
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          }

          .chatbox {
            display: none;
            position: absolute;
            bottom: 60px;
            width: 320px;
            height: 440px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: fadeIn 0.3s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .chat-header {
            background: #4f46e5;
            color: white;
            padding: 12px;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .close-btn {
            cursor: pointer;
            font-weight: bold;
            background: none;
            border: none;
            color: white;
            font-size: 18px;
          }

          .chat-messages {
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            font-size: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .msg {
            max-width: 80%;
            padding: 8px 12px;
            border-radius: 12px;
            line-height: 1.4;
            display: flex;
            align-items: flex-start;
            gap: 8px;
          }

          .user {
            align-self: flex-end;
            background: #e0e0ff;
            border-bottom-right-radius: 0;
          }

          .bot {
            align-self: flex-start;
            background: #f5f5f5;
            border-bottom-left-radius: 0;
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
          }

          .chat-input button {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 12px 16px;
            cursor: pointer;
            font-weight: 600;
          }

          .quick-replies {
            padding: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .quick-replies button {
            background: #e0e7ff;
            border: none;
            padding: 6px 10px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 13px;
          }
        </style>

        <div class="chat-widget">
          <div class="emoji-button" title="Ouvrir le chat">💬</div>
          <div class="chatbox">
            <div class="chat-header">
              Chat Assistant
              <button class="close-btn">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="quick-replies"></div>
            <div class="chat-input">
              <input type="text" placeholder="Tapez votre message..." />
              <button>➤</button>
            </div>
          </div>
        </div>
      `;

      this.shadowRoot.appendChild(container);

      // Eléments
      this.emojiButton = this.shadowRoot.querySelector(".emoji-button");
      this.chatbox = this.shadowRoot.querySelector(".chatbox");
      this.input = this.shadowRoot.querySelector("input");
      this.sendButton = this.shadowRoot.querySelector("button");
      this.messages = this.shadowRoot.querySelector(".chat-messages");
      this.quickReplies = this.shadowRoot.querySelector(".quick-replies");
      this.closeButton = this.shadowRoot.querySelector(".close-btn");

      // Événements
      this.emojiButton.addEventListener("click", () => this.openChat());
      this.closeButton.addEventListener("click", () => this.closeChat());
      this.sendButton.addEventListener("click", () => this.handleSend());
      this.input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleSend();
      });

      // Initialisation
      this.updatePosition(position);
      this.updateSize(size);
    }

    openChat() {
      this.chatbox.style.display = "flex";
      this.input.focus();
      this.pushBotMessage("Bonjour 👋 Que puis-je faire pour vous ?", [
        "Quels sont vos horaires ?",
        "Où êtes-vous situé ?",
        "Comment puis-je vous contacter ?"
      ]);
    }

    closeChat() {
      this.chatbox.style.display = "none";
    }

    handleSend(text = null) {
      const userText = text || this.input.value.trim();
      if (!userText) return;
      this.input.value = "";
      this.appendMessage(userText, "user");

      // Réponse simulée
      setTimeout(() => {
        const response = this.getBotReply(userText);
        this.appendMessage(response, "bot");
      }, 600);
    }

    appendMessage(text, sender = "bot") {
      const msg = document.createElement("div");
      msg.className = `msg ${sender}`;
      msg.textContent = text;
      this.messages.appendChild(msg);
      this.messages.scrollTop = this.messages.scrollHeight;

      this.resetInactivityTimer();
    }

    pushBotMessage(text, replies = []) {
      this.appendMessage(text, "bot");
      this.quickReplies.innerHTML = "";
      replies.forEach(reply => {
        const btn = document.createElement("button");
        btn.textContent = reply;
        btn.onclick = () => this.handleSend(reply);
        this.quickReplies.appendChild(btn);
      });
    }

    getBotReply(text) {
      const lower = text.toLowerCase();
      if (lower.includes("horaire")) return "Nous sommes ouverts du lundi au vendredi de 9h à 18h.";
      if (lower.includes("où") || lower.includes("situé")) return "Nous sommes situés à Paris, 10 rue de l’Exemple.";
      if (lower.includes("contact")) return "Vous pouvez nous contacter à contact@example.com.";
      return "Merci pour votre message ! Nous reviendrons vers vous très vite.";
    }

    resetInactivityTimer() {
      if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
      this.inactivityTimer = setTimeout(() => this.closeChat(), 90_000);
    }

    updatePosition(position) {
      const widget = this.shadowRoot.querySelector(".chat-widget");
      widget.style.left = position === "left" ? "20px" : "";
      widget.style.right = position === "right" ? "20px" : "";
    }

    updateSize(size) {
      let fontSize = "32px";
      if (size === "small") fontSize = "20px";
      else if (size === "large") fontSize = "48px";
      this.emojiButton.style.fontSize = fontSize;
    }
  }

  customElements.define("hello-world", HelloWorld);
}
