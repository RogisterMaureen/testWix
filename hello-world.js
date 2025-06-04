if (!customElements.get("hello-world")) {
  class HelloWorld extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      const position = this.getAttribute("position") === "left" ? "left" : "right";

      const container = document.createElement("div");
      container.innerHTML = `
        <style>
          .chat-widget {
            position: fixed;
            bottom: 20px;
            ${position}: 20px;
            z-index: 9999;
            font-family: sans-serif;
          }

          .emoji-button {
            font-size: 32px;
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
            ${position}: 0;
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

      // Interactions
      const emojiButton = this.shadowRoot.querySelector(".emoji-button");
      const chatbox = this.shadowRoot.querySelector(".chatbox");
      const input = this.shadowRoot.querySelector("input");
      const sendButton = this.shadowRoot.querySelector("button");
      const messages = this.shadowRoot.querySelector(".chat-messages");

      emojiButton.addEventListener("click", () => {
        const isOpen = chatbox.style.display === "flex";
        chatbox.style.display = isOpen ? "none" : "flex";
      });

      sendButton.addEventListener("click", () => {
        const text = input.value.trim();
        if (text) {
          const userMsg = document.createElement("div");
          userMsg.textContent = text;
          messages.appendChild(userMsg);
          input.value = "";
          messages.scrollTop = messages.scrollHeight;
        }
      });

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendButton.click();
      });
    }
  }

  customElements.define("hello-world", HelloWorld);
}
