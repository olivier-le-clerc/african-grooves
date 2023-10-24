import { AgTrack } from "./AgTrack";
customElements.define('ag-track',AgTrack)

import { AudioControls } from "./AudioControls";
customElements.define('audio-controls',AudioControls)

export function agAudioPlayer() {

    customElements.define('ag-audio-player', AgAudioPlayer)
    return document.querySelector('ag-audio-player')
}


class AgAudioPlayer extends HTMLElement {

    constructor(data = null) {
        super()

        this.data = {}
        this.current = 0

        this.innerHTML = this.template

        this.controls = new AudioControls()
        this.controls.buttons.play.onclick = e => this.toggle()
        this.controls.buttons.next.addEventListener('click', (e) => this.next())

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
            this.next();
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

    next() {
        let wasPlaying = this.isPlaying

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
        } else {
            this.current = 0
        }




        if (wasPlaying) this.audio.play()
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

            // let title = document.querySelector('#audio-player-main-title');
            this.title.innerHTML = playlistData.title;

            // first track

            let trackData = playlistData.content.shift();
            // let firstTrack = this.getTrack(trackData);

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



