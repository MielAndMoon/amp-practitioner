import { getToken } from "../utils/utils.js"
import { getStudents, getPractitioners, isAttendanceComplete, isOnlySetEntryTime, createAttendance, setExitTime } from "../api/index.js"
import { API_KEY } from "../utils/constants.js"
import { ModalInformation } from "./ModalInformation.js"

class FormAttendance extends HTMLElement {
    static name = "form-attendance"
    cleanTimeout;

    static get style() {
        return /* css */`
        :host * {
            box-sizing: border-box;
            margin: 0;
        }

        :host {
            line-height: inherit;
            width: 100%;
            font-family: "Dosis", sans-serif;
            grid-column: 2/3;
        }

        .form {
            margin: auto;
            padding: 2rem;
            background-color: rgb(31 41 55);
            border-radius: 0.5rem;
        }

        @media (min-width: 640px) {
            .form {
                max-width: 32rem;
            }
        }

        .form__form {
            tab-size: 4;
            border-width: 0;
            margin-top: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .form__input {
            border-style: solid;
            margin: 0;
            width: 100%;
            border-radius: 0.5rem;
            border-width: 1px;
            padding: 0.625rem;
            color: #fff;
            font-family: inherit;
            font-weight: 400;
            letter-spacing: .1rem;
            display: block;
            font-size: 1rem;
            line-height: 1.25rem;
            border-color: rgb(75 85 99);
            background-color: rgb(55 65 81);
        }

        .form__input:focus-visible {
            outline: none;
        }

        .form__input:focus {
            outline: 2px solid rgb(59 130 246);
        }

        .form__label {
            line-height: 1.25rem;
            font-weight: 500;
            color: #ffffff;
            font-weight: 500;
            display: block;
            margin-bottom: 0.5rem;
        }
        
        .form__title {
            margin: 0;
            letter-spacing: -0.025em;
            font-size: 1.5rem;
            line-height: 2rem;
            text-align: center;
            font-weight: 700;
            color: rgb(255 255 255);
        }

        .container__errors {
            margin-top: 2rem;
        }

        .hidden {
            display: none;
        }

        .form__errors {
            border-style: solid;
            display: flex;
            align-items: center;
            border-radius: 0.5rem;
            border-width: 1px;
            padding: 1rem;
            line-height: 1.25rem;
            border-color: rgb(153 27 27);
            background-color: rgb(31 41 55);
            color: rgb(248 113 113);
        }

        .errors__icon {
            font-size: 0.875rem;
            line-height: 1.25rem;
            color: rgb(248 113 113);
            fill: currentcolor;
            border-width: 0;
            border-style: solid;
            border-color: #e5e7eb;
            vertical-align: middle;
            margin-inline-end: 0.75rem;
            display: inline;
            height: 1rem;
            width: 1rem;
            flex-shrink: 0;
        }

        .errors__icon--text {
            font-size: 1rem;
            line-height: 1.25rem;
            color: rgb(248 113 113);
            border-style: solid;
            border-color: #e5e7eb;
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0,0,0,0);
            white-space: nowrap;
            border-width: 0;
        }

        .errors__messages {
            margin: 0;
        }
        `
    }

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
    }

    #validateDni = (dni) => {
        if (isNaN(dni)) {
            this.containerErrors.classList.remove("hidden")
            this.messageErrors.textContent = "El dni debe contener solo números"
            return false
        }
        if (dni.length !== 8) {
            this.containerErrors.classList.remove("hidden")
            this.messageErrors.textContent = "El dni debe tener 8 caracteres"
            return false
        }
        return true
    }

    #getFormatDate = () => {
        let nowDate = new Date()
        let year = nowDate.getFullYear();
        let month = String(nowDate.getMonth() + 1).padStart(2, '0');
        let day = String(nowDate.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    #getFormatTime = () => {
        let nowDate = new Date()
        let hour = nowDate.getHours()
        let minute = nowDate.getMinutes()
        let second = nowDate.getSeconds()

        return `${hour}:${minute}:${second}`
    }


    #showModalInformation = (title, state, data) => {
        if (this.cleanTimeout) {
            clearTimeout(this.cleanTimeout)
        }

        this.cleanTimeout = setTimeout(() => {
            this.modalInformation.classList.remove('show')
            this.modalInformation.remove()
        }, 5000)


        this.modalInformation.setAttribute("state", state)
        this.modalInformation.setAttribute("title", title)

        if (state === "error") {
            this.modalInformation.innerHTML = `<p class="modal__description">${data.message}</p>`
        } else {
            const student = this.students.data.find((student) => student.dni === data.practitioner)
            let fullname = student.first_name + " " + student.last_name
            if (state === "success") {
                let timeRegistred = data.exit_time === null
                    ? `<p class="modal__description">Hora de entrada: <span class="modal__description--bold">${data.entry_time}</span></p>`
                    : `<p class="modal__description">Hora de salida: <span class="modal__description--bold">${data.exit_time}</span></p>`
                this.modalInformation.innerHTML = `<p class="modal__description">Practicante: <span class="modal__description--bold">${fullname}</span></p>` + timeRegistred
            }
            if (state === "info") {
                this.modalInformation.innerHTML = `<p class="modal__description">Practicante: <span class="modal__description--bold">${fullname}</span></p>
            <p>Hora de entrada: <span class="modal__description--bold">${data.entry_time}</span></p><p>Hora de salida: <span class="modal__description--bold">${data.exit_time}</span></p>`
            }
        }

        document.querySelector(".main").appendChild(this.modalInformation)
        this.modalInformation.classList.add('show')
    }

    async handleEvent(event) {
        if (event.type === "submit") {
            event.preventDefault()
        }
        if (event.type === "input") {
            const dni = this.dniInput.value
            if (this.#validateDni(dni)) {
                const practitionerSearch = this.practitioners.data.find((practitioner) => practitioner.student_id === dni)
                if (practitionerSearch) {
                    this.containerErrors.classList.add("hidden")

                    const isAttendanceCompleted = await isAttendanceComplete(this.token, dni, this.#getFormatDate())

                    if (isAttendanceCompleted.exists) {
                        this.#showModalInformation("Informacion de asistencia", "info", isAttendanceCompleted.data)
                        this.dniInput.value = ""
                    }
                    else {
                        if (await isOnlySetEntryTime(this.token, dni, this.#getFormatDate())) {
                            const isSetExitTime = await setExitTime(this.token, dni, this.#getFormatDate(), this.#getFormatTime())
                            if (isSetExitTime.updated) {
                                this.#showModalInformation("Hora de salida registrada", "success", isSetExitTime.data)
                            } else {
                                this.#showModalInformation("Error al registrar la asistencia", "error", {
                                    message: "Ocurrio un error al registrar la hora de salida"
                                })
                            }
                            this.dniInput.value = ""
                        } else {
                            const isCreatedAttendance = await createAttendance(this.token, dni, this.#getFormatDate(), this.#getFormatTime())
                            if (isCreatedAttendance.created) {
                                this.#showModalInformation("Hora de entrada registrada", "success", isCreatedAttendance.data)
                            } else {
                                this.#showModalInformation("Error al registar la asistencia", "error", {
                                    message: "Ocurrio un error al registrar la hora de entrada"
                                })
                            }
                            this.dniInput.value = ""
                        }
                    }
                    this.dniInput.value = ""
                    this.practitioners = await getPractitioners(API_KEY)
                } else {
                    this.containerErrors.classList.remove("hidden")
                    this.messageErrors.textContent = "El practicante no existe"
                }
            }
        }
    }

    async connectedCallback() {
        this.shadowRoot.innerHTML = /* html */`
<style>
    ${FormAttendance.style}
</style>
    <div class="form">
        <h1 class="form__title">
            Registro de asistencia
        </h1>
        <form method="POST" id="formAttendance" class="form__form" autocomplete="off">
            <slot></slot>
            <div>
                <label for="dni" class="form__label">Dni</label>
                <input type="text" name="dni" id="dniInput" autofocus class="form__input" placeholder="89125678"
                    required="" maxlength="8" minlength="8" pattern="[0-9]{8}">
            </div>

            <div class="container__errors hidden" id="containerErrors">
                <div class="form__errors" role="alert" id="errors">
                    <svg class="errors__icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>

                    <span class="errors__icon--text">Info</span>
                    <p class="errors__messages" id="messageErrors">Not found</p>
                </div>
            </div>
        </form>
    </div>
</div>
        `

        this.token = getToken("csrftoken")
        this.formAttendance = this.shadowRoot.getElementById("formAttendance")
        this.containerErrors = this.shadowRoot.getElementById("containerErrors")
        this.messageErrors = this.shadowRoot.getElementById("messageErrors")
        this.dniInput = this.shadowRoot.getElementById("dniInput")

        this.dniInput.addEventListener("input", this)
        this.practitioners = await getPractitioners(API_KEY)
        this.students = await getStudents(API_KEY)
        this.formAttendance.addEventListener("submit", this)
        this.modalInformation = new ModalInformation()
    }

    disconnectedCallback() {
        this.dniInput.removeEventListener("input", this)
    }
}

customElements.define(FormAttendance.name, FormAttendance)