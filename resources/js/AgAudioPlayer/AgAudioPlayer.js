import { AgTrack } from "./AgTrack";
customElements.define('ag-track', AgTrack)

import { AudioControls } from "./AudioControls";
customElements.define('audio-controls', AudioControls)

export class AgAudioPlayer extends HTMLElement {

    constructor(data = null) {
        super()

        this.data = {}
        this.current = -1

        this.settings = {
            repeat: false,
        }

        this.innerHTML = this.template

        this.controls = new AudioControls()
        this.controls.buttons.play.onclick = e => this.toggle()
        this.controls.buttons.next.addEventListener('click', (e) => this.next(this.isPlaying))

        this.controls.buttons.repeat.addEventListener('click', e => {
            this.controls.buttons.repeat.classList.toggle('button--is-active')
            this.settings.repeat = !this.settings.repeat
        })

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

        this.clear()
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

    get isPlaying() { return !this.audio.paused && this.audio.duration > 0; }

    get title() { return this.querySelector('#audio-player-main-title') }

    get audio() { return this.querySelector('audio') }

    get playlist() { return this.querySelector('#playlist') }

    toggle() {
        this.isPlaying ? this.audio.pause() : this.audio.play()
    }

    next(playNext = false) {

        this.current++
        if (next = this.querySelector('.track--future')) {

            next.classList.remove('track--future');
            next.classList.add('track--previous');

            let current = this.querySelector('#current-song');
            current.innerHTML = next.innerHTML;
            current.dataset.mp3_path = next.dataset.mp3_path;
            current.dataset.id = next.dataset.id;
            current.appendChild(this.controls);

            this.playlist.scrollTo({
                top: next.offsetTop + next.offsetHeight,
                behavior: "smooth"
            })

            this.audio.src = next.dataset.src;

            if (playNext) this.audio.play()
        } else {
            this.current = -1
            this.querySelectorAll('.track--previous').forEach(e => {
                e.classList.remove('track--previous')
                e.classList.add('track--future')
            })
            this.next(this.settings.repeat)
        }

    }

    goto(element = null) {
        let playing = this.isPlaying
        let next = this.playlist.querySelector('--track--future')
        let target = element ? element : next;
        if (next !== null) {
            while (next !== target) {
                // tracks.removeChild(next);
                next.classList.remove('track--future');
                next.classList.add('track--previous');
                next = tracks.querySelector('.track--future');
            }
            next.classList.remove('track--future');
            next.classList.add('track--previous');
            let current = this.playlist.querySelector('#current-song');
            let controls = current.querySelector('.controls');
            current.innerHTML = next.innerHTML;
            current.dataset.mp3_path = next.dataset.mp3_path;
            current.dataset.id = next.dataset.id;
            current.querySelector('.track-infos').appendChild(controls);
            tracks.scrollTo(0, 0);
            this.audio.src = next.dataset.src;
            if (playing) this.audio.play();
        }
    }

    update(playlistData) {
        let wasPlaying = this.isPlaying

        if (playlistData.content.length > 0) {

            // update title
            this.title.innerHTML = playlistData.title;

            // first track
            let trackData = playlistData.content.shift();
            let firstTrack = AgTrack.get(trackData);

            firstTrack.id = "current-song"

            firstTrack.appendChild(this.controls)

            this.audio.src = firstTrack.dataset.src;
            this.querySelector("#current-song").replaceWith(firstTrack)

            // playlist
            this.clear()
            playlistData.content.forEach(e => {
                this.add(e)
            });

            this.next()

            if (wasPlaying) {
                this.audio.play()
            }
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



