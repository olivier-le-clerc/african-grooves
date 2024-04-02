export class AudioControls extends HTMLElement {

    get template() {
        return `
        <div id="progress-bar">
            <div id="completion"></div>
        </div>
        <div>
            <button id="back" event="back" class="player-button button-back"><i class="fa-solid fa-backward-fast"></i></button>
            <button id="play" event="play" class="player-button button-play" ><i class="fa-solid fa-play"></i></button>
            <button id="next" event="next" class="player-button button-next"><i class="fa-solid fa-forward-fast"></i></button>
            <button id="repeat" event="repeat" class="player-button button-repeat"><i class="fa-solid fa-repeat"></i></button>
            <button id="shuffle" event="shuffle" class="player-button button-shuffle"><i class="fa-solid fa-shuffle"></i></button>
        </div>
        <div><button id="plus" event="plus">article</button></div>


    `
    }

    constructor() {
        super()
        this.innerHTML = this.template

        this.progressBar = this.querySelector('#progress-bar')
        this.progressBar.addEventListener('click', e => {
            let container = {
                x : this.querySelector('#progress-bar').offsetLeft,
                width : this.querySelector('#progress-bar').clientWidth,
            }
            let progress = (e.clientX - container.x) / container.width

            this.progress = Math.floor(100 * progress)

            this.dispatchEvent(new CustomEvent('progressBarClick', {
                detail: { progress: progress } }))
        })

        this.buttons = {}
        this.querySelectorAll('button').forEach(b => this.buttons[b.id] = b)
    }

    set progress(percent) {
        this.querySelector('#progress-bar #completion').style.width = percent + "%"
    }
}
