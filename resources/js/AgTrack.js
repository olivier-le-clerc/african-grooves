export function AgTrack() {

    class AgTrack extends HTMLElement {

        get template() {
            return `
                <img class="track-thumb" src="${this.data.image_path}">
                <div class="track-infos">
                    <h3 id="track-title" class="track-text track-title">${this.data.song_title}</h3>
                    <h4 id="track-artist" class="track-text track-artist">${this.data.artist}</h4>
                    <div class='controls'>
                        <button id="play" class="player-button button-play" onclick="playPause()"><i class="fa-solid fa-play"></i></button>
                        <button id="next" class="player-button button-next" onclick="next()"><i class="fa-solid fa-forward-fast"></i></button>
                        <button id="plus" class="player-button button-plus" onclick="postModal()"><i class="fa-solid fa-circle-info"></i></button>
                    </div>
                </div>
            `
        }

        constructor(data = null) {
            super()
            this.data = data
            this.innerHTML = this.template

            this.dataset.src = data.mp3_path
            this.dataset.id = data.id
        }

    }

    customElements.define('ag-track', AgTrack)
}