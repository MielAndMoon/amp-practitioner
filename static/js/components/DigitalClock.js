import { namesOfDays, namesOfMonths } from '../utils/constants.js'

class DigitalClock extends HTMLElement {
    static name = 'digital-clock'

    #getCurrentTime = () => {
        let date = new Date()
        let hour = date.getHours()
        let minutes = date.getMinutes()
        let seconds = date.getSeconds()

        hour = hour < 10 ? '0' + hour : hour
        minutes = minutes < 10 ? '0' + minutes : minutes
        seconds = seconds < 10 ? '0' + seconds : seconds

        return {
            hour, minutes, seconds
        }
    }

    #getCurrentDate = () => {
        let date = new Date()
        let dayDate = date.getDate()
        let dayNumber = date.getDay()
        let month = date.getMonth() + 1

        return {
            dayName: namesOfDays[dayNumber],
            dayDate,
            month: namesOfMonths[month],
            year: date.getFullYear()
        }
    }

    #setCurrentTime = () => {
        let { dayName, dayDate, month, year } = this.#getCurrentDate()
        this.shadowRoot.querySelector('.clock__date').textContent = `${dayName}, ${dayDate} de ${month} de ${year}`
        this.shadowRoot.querySelector('.clock__hour').textContent = this.#getCurrentTime().hour
        this.shadowRoot.querySelector('.clock__minutes').textContent = this.#getCurrentTime().minutes
        this.shadowRoot.querySelector('.clock__seconds').textContent = this.#getCurrentTime().seconds
    }

    #updateTime = () => {
        const updateClock = () => {
            const { dayName, dayDate, month, year } = this.#getCurrentDate();
            const { hour, minutes, seconds } = this.#getCurrentTime();
            this.shadowRoot.querySelector('.clock__date').textContent = `${dayName}, ${dayDate} de ${month} de ${year}`;
            this.shadowRoot.querySelector('.clock__hour').textContent = hour;
            this.shadowRoot.querySelector('.clock__minutes').textContent = minutes;
            this.shadowRoot.querySelector('.clock__seconds').textContent = seconds;
        };

        setInterval(updateClock, 1000);
    }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = /* html */ `
            <style>
                :host {
                    grid-column: 2/3;
                    grid-row: 1/2;
                    color: white;
                    flex-direction: column;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 3rem 0;
                    font-family: "Dosis", sans-serif;
                    z-index: 200;
                    justify-self: center;
                    height: min-content;


                }

                @media (min-width: 640px) {
                    :host {
                        max-width: 20rem;
                    }
                }

                .clock__time {
                    font-family: "Roboto Mono", monospace;
                    font-size: 4rem;
                    font-weight: bold;
                    letter-spacing: 0;
                }
            </style>
                <div class="clock__time"><span class="clock__hour"></span>:<span class="clock__minutes"></span>:<span class="clock__seconds"></span></div>
                <span class="clock__date"></span>
        `
        this.#setCurrentTime()
        this.#updateTime()
    }
}

customElements.define(DigitalClock.name, DigitalClock)