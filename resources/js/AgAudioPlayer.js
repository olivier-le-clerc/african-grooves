import { AgTrack } from "./AgTrack";

export function AgAudioPlayer() {

    class AgAudioPlayer extends HTMLElement {

        get template() {
            return `
            <audio src=""></audio>
            <header>
                <div id="title">
                    <h2 id="audio-player-main-title">Recent Tracks</h2>
                    <button id="playlist-toggle-button" onclick="togglePlaylist()">
                        <i class="fa-solid fa-chevron-up"></i>
                    </button>
                </div>
                <div id="current-song" class="track" data-id="" data-src="">
                </div>
            </header>
            <div id="playlist">
            </div>
            `
        }

        getTrack(data) {
            let track = document.createElement('div')
            track.classList.add('track')
            track.id = data.id
            track.dataset['src'] = data.mp3_path
            track.innerHTML = `
                <img class="track-thumb" src="${data.image_path}">
                <div class="track-infos">
                    <h3 id="track-title" class="track-text track-title">${data.song_title}</h3>
                    <h4 id="track-artist" class="track-text track-artist">${data.artist}</h4>
                </div>
             `
            return track
        }

        getControls() {
            let controls = document.createElement('div')
            controls.classList.add('controls')
            controls.innerHTML = `
                <button id="play" class="player-button button-play" ><i class="fa-solid fa-play"></i></button>
                <button id="next" class="player-button button-next" onclick="next()"><i class="fa-solid fa-forward-fast"></i></button>
                <button id="plus" class="player-button button-plus" onclick="postModal()"><i class="fa-solid fa-circle-info"></i></button>
            `
            controls.querySelector('#play').addEventListener("click", e => this.toggle())
            controls.querySelector('#next').addEventListener("click", e => this.next)
            controls.querySelector('#plus').addEventListener("click", e => console.log("plus"))
            return controls
        }

        toggle() {
            this.isPlaying ? this.audio.pause() : this.audio.play()
        }

        next(element = null) {
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
                let firstTrack = this.getTrack(trackData);
                firstTrack.id = "current-song"
                firstTrack.querySelector(".track-infos").appendChild(this.getControls())
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

        get isPlaying() {
            return !this.audio.paused && this.audio.duration > 0;
        }

        get title() {
            return this.querySelector('#audio-player-main-title')
        }

        get audio() {
            return this.querySelector('audio')
        }

        get playlist() {
            return this.querySelector('#playlist')
        }

        static observedAttributes = ["data-current", "data-playing"]

        constructor(data = null) {
            super()
            this.innerHTML = this.template
            this.clear()
        }

        attributeChangedCallback(name, oldVal, newVal) {
            console.log(`Attribute ${name} has changed.`);
        }

        clear() {
            this.playlist.innerHTML = ''
            this.dataset["current"] = 0
            this.dataset["playing"] = false
        }

        add(trackData) {
            let track = this.getTrack(trackData)
            track.classList.add('track--future')
            this.playlist.appendChild(track)
        }

    }

    customElements.define('ag-audio-player', AgAudioPlayer)
    return document.querySelector('ag-audio-player')
}



