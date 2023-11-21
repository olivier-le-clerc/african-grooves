
export class AgCurrentTrack extends HTMLElement {

    constructor() {
        super()

        this.innerHTML = this.template

        this.progressBar = this.querySelector('#progress-bar')
        this.progressBar.addEventListener('click', e => {
            e.preventDefault()
            let container = {
                x: this.querySelector('#progress-bar').offsetLeft,
                width: this.querySelector('#progress-bar').clientWidth,
            }
            let progress = (e.clientX - container.x) / container.width

            this.progress = Math.floor(100 * progress)

            this.dispatchEvent(new CustomEvent('player-controls', {
                detail: {
                    action: 'progress-bar',
                    progress: progress
                }
            }))
        })

        this.buttons = {}

        this.querySelectorAll('button').forEach(b => {
            this.buttons[b.id] = b
            b.addEventListener('click', e => {
                e.preventDefault()
                this.dispatchEvent(new CustomEvent('player-controls', {
                    detail: {
                        action: b.id
                    }
                }))
            })
        })
    }

    get template() {
        return `
            <img id="track-thumb" class="track-thumb">

            <div id="current-song-title">
                <h3></h3>
            </div>
            <!-- <h3 id="track-title" class="track-text track-title"></h3> -->

            <div id="progress-bar"><div id="completion"></div></div>
            <div id="buttons">
                <button id="back" event="back" class="player-button button-back"><i class="fa-solid fa-backward-fast"></i></button>
                <button id="play" event="play" class="player-button button-play" ><i class="fa-solid fa-play"></i></button>
                <button id="next" event="next" class="player-button button-next"><i class="fa-solid fa-forward-fast"></i></button>
                <button id="repeat" event="repeat" class="player-button button-repeat"><i class="fa-solid fa-repeat"></i></button>
                <button id="shuffle" event="shuffle" class="player-button button-shuffle"><i class="fa-solid fa-shuffle"></i></button>
            <button id="plus" class="player-button"><strong>Article</strong></button>

            </div>

        `
    }

    set progress(percent) {
        this.querySelector('#progress-bar #completion').style.width = percent + "%"
    }

    update(data) {
        this.data = data
        // this.innerHTML = this.template
        this.dataset.postId = data.post_id
        this.dataset.src = data.mp3_path

        let h3 = this.querySelector("#current-song-title h3")
        let title = data.song_title + " - " + data.artist

        h3.innerHTML = title
        // autoscroll if too long title

        document.querySelector("#current-song-title h3").classList.remove('autoScroll')
        if(h3.scrollWidth > h3.clientWidth){
            document.querySelector("#current-song-title h3").classList.add('autoScroll')
        }


        this.querySelector("img#track-thumb").src = data.image_path
    }

}