
export class AgTrack extends HTMLElement {

    constructor() {
        super()
    }

    get template() {
        return `
            <img class="track-thumb" src="${this.data.image_path}">
                <h3 id="track-title" class="track-text track-title">${this.data.song_title}</h3>
                <h4 id="track-artist" class="track-text track-artist">${this.data.artist}</h4>
        `
    }

    static get(data=null){
        let track = new AgTrack()
        track.dataset.postId = data.post_id
        track.dataset.src = data.mp3_path
    
        track.data = data
        track.innerHTML = track.template
        return track
    }
}
