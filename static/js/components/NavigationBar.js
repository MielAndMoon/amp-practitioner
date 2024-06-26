class NavigationBar extends HTMLElement {
  static name = 'navigation-bar'

  static get style() {
    return /* css */`
    a {
      text-decoration: none
    }

    :host {
      height: min-content;
      font-family: inherit;
      background-color: #111827;
      display: block;
      width: 100%;
      box-sizing: inherit;
    }
    
    .nav {
      background-color: #111827;
    }

    .nav__container {
      display: flex;
      padding: 1rem;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      max-width: 1280px;
      tab-size: 4;
      margin-left: auto;
      margin-right: auto;
    }
  
    .nav__logo {
      border-width: 0;
      border-style: solid;
      border-color: #e5e7eb;
      color: inherit;
      text-decoration: inherit;
      display: flex;
      align-items: center;
  
    }
  
    .nav__logo--img {
      height: 2rem;
    }
  
    .nav__logo--text {
      box-sizing: inherit;
      align-self: center;
      font-family: "Dosis", sans-serif;
      white-space: nowrap;
      font-size: 1.5rem;
      line-height: 2rem;
      font-weight: 600;
      color: #ffffff;
      margin-right: 0.75rem;
      margin-left: 0.75rem;

    }
  
    .nav__actions {
      display: flex;
      margin-left: 0.75rem;
      gap: 2rem;
    }
  
    @media (min-width: 768px) {
      .nav__actions {
        margin-left: 0;
        order: 2;
      }
    }
  
    .nav__actions--button {
      line-height: 1.25rem;
      color: #ffffff;
      background: none;
      color: #fff;
      padding: 12px 0px 10px 0px;
      border: 1px solid #fff;
      outline: none;
      border-radius: 7px;
      width: 150px;
      font-size: 1rem;
      text-align: center;
      display: block;
      font-family: "Dosis", sans-serif;
      font-weight: 400;
    }

    .nav__actions--button:hover {
      color: #ffbb39;
      border-color: #ffbb39;
      cursor: pointer;
      opacity: 1;
    }
    `
  }

  constructor() {
    super();
    this.imageUrl = this.getAttribute("image-url")
    this.attachShadow({ mode: "open" })
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = /* html */`
 <style>
   ${NavigationBar.style}
 </style>
 <nav class="nav">
   <div class="nav__container">
     <a href="/" class="nav__logo">
       <img src="${this.imageUrl}" alt="Logo de asistencia de la municipalidad de San Roman" class="nav__logo--img">
       <span class="nav__logo--text">Asistencia</span>
     </a>
     <div class="nav__actions">
       <a href="/admin/" class="nav__actions--button">Administrador</a>
     </div>
   </div>
 </nav>`
  }
}

customElements.define(NavigationBar.name, NavigationBar)