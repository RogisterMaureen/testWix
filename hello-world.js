class HelloWorld extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    console.log("Custom element added to page.");
    this.innerHTML = "<p>Hello from HelloWorld element!</p>";
  }

  disconnectedCallback() {
    console.log("Custom element removed from page.");
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.");
  }
}

customElements.define("hello-world", HelloWorld);
