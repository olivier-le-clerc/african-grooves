export class AudioControls extends HTMLElement {

    get template() {
        return `
        <button id="play" event="play" class="player-button button-play" ><i class="fa-solid fa-play"></i></button>
        <button id="next" event="next" class="player-button button-next"><i class="fa-solid fa-forward-fast"></i></button>
        <button id="plus" event="plus" class="player-button button-plus"><i class="fa-solid fa-circle-info"></i></button>
    `
    }

    constructor() {
        super()
        this.innerHTML = this.template

        this.buttons = {}
        this.querySelectorAll('button').forEach(b => this.buttons[b.id] = b)
    }
}