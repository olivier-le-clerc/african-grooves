import { AgTrack } from "./AgTrack";
customElements.define('ag-track', AgTrack)

import { AudioControls } from "./AudioControls";
customElements.define('audio-controls', AudioControls)

export class AgAudioPlayer extends HTMLElement {

    constructor() {
        super()

        this.data = {}
        // this.current = -1

        this.settings = {
            repeat: false,
            shuffle: false,
        }

        this.innerHTML = this.template

        this.controls = new AudioControls()
        this.controls.buttons.play.onclick = e => this.toggle()
        this.controls.buttons.next.addEventListener('click', (e) => this.next(this.isPlaying))

        this.controls.buttons.repeat.addEventListener('click', e => {
            this.controls.buttons.repeat.classList.toggle('button--is-active')
            this.settings.repeat = !this.settings.repeat
        })

        this.controls.buttons.shuffle.onclick = e => {
            this.controls.buttons.shuffle.classList.toggle('button--is-active')
            this.settings.shuffle = !this.settings.shuffle
        }

        this.audio.addEventListener('playing', e => {
            let buttons = document.querySelectorAll('.button-play i');
            buttons.forEach(i => {
                i.classList.remove('fa-play');
                i.classList.add('fa-pause');

            });

        });

        this.audio.addEventListener('pause', e => {
            let buttons = document.querySelectorAll('.button-play i');
            buttons.forEach(i => {
                i.classList.remove('fa-pause');
                i.classList.add('fa-play');
            });
        });

        this.audio.addEventListener('ended', e => {
            this.next(this.isPlaying);
            audio.play();
        })
    }

    get template() {
        return `
            <!-- header content always visible -->
            <header>
                <div id="title" class="top-bar">
                    <h2 id="audio-player-main-title" class="title">Recent Tracks</h2>
                    <button id="playlist-toggle-button">
                        <i class="fa-solid fa-chevron-up"></i>
                    </button>
                </div>
                <div id="current-song" class="track" data-id="" data-src=""></div>
            </header>

            <audio src=""></audio>

            <!-- drawer content is hidden on mobiles -->
            <div class="body">
                <div id="playlist" class="scrollable"></div>
            </div>
            `
    }

    get currentTrack(){
        return this.querySelector('#current-song')
    }

    get isPlaying() { return !this.audio.paused && this.audio.duration > 0; }

    get title() { return this.querySelector('#audio-player-main-title') }

    get audio() { return this.querySelector('audio') }

    get playlist() { return this.querySelector('#playlist') }

    toggle() {
        this.isPlaying ? this.audio.pause() : this.audio.play()
    }

    get nextTrack() {
        let res = null
        if (this.settings.shuffle == true) {
            let tracks = this.querySelectorAll('.track--future')
            if (tracks.length > 0) {
                // return random track
                let randomIndex = Math.floor(Math.random() * tracks.length)
                res = tracks.item(randomIndex)
            }
        } else {
            res = this.querySelector('.track--future')
        }
        return res;
    }

    next(playNext = false) {

        // this.current++
        this.querySelector('.track--current')?.classList.remove('track--current')

        let next = this.nextTrack

        if (next !== null) {

            next.classList.remove('track--future');

            this.renderCurrent(next)

            next.classList.add('track--previous', 'track--current');

            if (this.settings.shuffle == false) {
                this.playlist.scrollTo({
                    top: next.offsetTop + next.offsetHeight,
                    behavior: "smooth"
                })
            }

            if (playNext == true) this.audio.play()

        } else {

            // this.current = -1
            this.querySelectorAll('.track--previous').forEach(e => {
                e.classList.remove('track--previous')
                e.classList.add('track--future')
            })

            this.next(this.settings.repeat)
        }

    }

    renderCurrent(track) {
        let firstTrack = track.cloneNode(true)
        // first track
        firstTrack.id = "current-song"
        firstTrack.appendChild(this.controls)
        this.audio.src = firstTrack.dataset.src;
        this.querySelector("#current-song").replaceWith(firstTrack)
    }

    update(playlistData) {
        let wasPlaying = this.isPlaying

        if (playlistData.content.length > 0) {
            // update title
            this.title.innerHTML = playlistData.title;
            // update playlist
            this.clear()
            playlistData.content.forEach(e => this.add(e));

            this.next()

            if (wasPlaying) this.audio.play()
        }
    }

    clear() {
        this.playlist.innerHTML = ''
        this.dataset["current"] = 0
        this.dataset["playing"] = false
    }

    add(trackData) {
        let track = AgTrack.get(trackData)
        track.classList.add('track--future')
        this.playlist.appendChild(track)
    }

}



