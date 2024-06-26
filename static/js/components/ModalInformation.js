class ModalInformation extends HTMLElement {
    static name = "modal-information"

    #modalState = {
        success: {
            color: "rgb(49 196 141);",
            backgroundColor: "rgb(1 71 55);",
            icon: `<svg aria-hidden="true" class="modal__icon" fill="currentColor" viewBox="0 0 20 20"
             xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd">
             </path></svg>`,
        },
        error: {
            color: "rgb(249, 128, 128);",
            backgroundColor: "rgb(119, 29, 29);",
            icon: `<svg class="modal__icon" aria-hidden="true"
                   xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                   <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>`
        },
        info: {
            color: "rgb(118, 169, 250);",
            backgroundColor: "rgb(35, 56, 118);",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="modal__icon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="40" d="M196 220h64v172"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="40" d="M187 396h138"/><path fill="currentColor" d="M256 160a32 32 0 1 1 32-32a32 32 0 0 1-32 32"/></svg> `
        }
    }

    static get style() {
        return /* css */`

        :host * {
            box-sizing: border-box;
            margin: 0;
        }

        :host {
            font-family: "Dosis", sans-serif;
            color: white;
            z-index: 100;
            grid-column: 3/4;
            height: min-content;
            border-radius: .5rem;
            padding: 1.25rem;
            background-color: rgb(31 41 55);
            position: relative;
            justify-self: center;
            width: 100%;
        }

        @media (min-width: 640px) {
            :host {
                max-width: 32rem;
            }
        }

        .modal__status--icon {
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            display: grid;
            place-items: center;
        }

        .modal__icon {
            width: 1rem;
        }

        .modal__header {
            display: flex;
            flex-direction: row;
            gap: .5rem;
            align-items: center;
            padding-bottom: .75rem;
        }

        .modal__status {
            font-size: 1.125rem;
            font-weight: bold;
        }

        .modal__practitioner {
            font-weight: bold;
        }

        .modal__entry-time {
            font-weight: bold;
        }

        .modal__close {
            background-color: transparent;
            position: absolute;
            top: .625rem;
            right: .625rem;
            border-radius: .5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            padding: .375rem;
        }

        .modal__close:hover {
            background-color: rgb(75 85 99);
        }

        .modal__icon--close {
            width: 1.25rem;
            color: rgb(156, 163, 175)
        }

        .modal__description {
            margin: 0;
        }

        ::slotted(p) {
            margin: 0;
        }

        `
    }

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.classList.add("hidden")
    }

    handleEvent(event) {
        if (event.type === "click") {
            this.classList.remove('show')
            setTimeout(() => this.remove(), 500)
        }
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = /* html */`
            <style>
            ${ModalInformation.style}
            .modal__status {
                color: ${this.#modalState[this.getAttribute("state")].color};
            }

            .modal__status--icon {
                background-color: ${this.#modalState[this.getAttribute("state")].backgroundColor};
            }

            .modal__icon {
                color: ${this.#modalState[this.getAttribute("state")].color};
            }
            </style>
            <article class="modal">
                <button class="modal__close">
                    <svg aria-hidden="true" class="modal__icon--close"
                     fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                     <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                     clip-rule="evenodd"></path></svg>
                </button>
                <div class="modal__header">
                    <div class="modal__status--icon">
                    ${this.#modalState[this.getAttribute("state")].icon}
                    </div>
                    <span class="modal__status">${this.getAttribute("title")}</span>
                </div>
                <slot></slot>
            </article>
        `
        this.modalClose = this.shadowRoot.querySelector(".modal__close")
        this.modalClose.addEventListener("click", this)
    }

    disconnectedCallback() {
        this.modalClose.removeEventListener("click", this)
    }
}

customElements.define(ModalInformation.name, ModalInformation)

export { ModalInformation }