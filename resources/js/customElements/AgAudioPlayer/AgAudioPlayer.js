import { AgTrack } from "./AgTrack";
customElements.define('ag-track', AgTrack)

import { AudioControls } from "./AudioControls";
customElements.define('audio-controls', AudioControls)

import { AgCurrentTrack } from "./AgCurrentTrack";
customElements.define('current-track', AgCurrentTrack)

import discogsUrl from '/img/Discogs_icon.svg'

export class AgAudioPlayer extends HTMLElement {

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
                <current-track></current-track>
            </header>

            <audio src=""></audio>

            <!-- drawer content is hidden on mobiles -->
            <div class="body">
                <div id="playlist" class="scrollable"></div>

                <div class="social-media mobile-only">
                    <h2>Follow us !</h2>
                <ul class="buttons">
                    <li class="icon-wrap"><a href="<?= get_option('youtube_link') ?>" target="_blank"><i class="fa-brands fa-youtube"></i></a></li>
                    <li class="icon-wrap"><a href="<?= get_option('instagram_link') ?>" target="_blank"><i class="fa-brands fa-instagram"></i></a></li>
                    <li class="icon-wrap"><a href="<?= get_option('facebook_link') ?>" target="_blank"><i class="fa-brands fa-facebook"></i></a></li>
                    <li class="icon-wrap"><a href="https://soundcloud.com/armand_de_preseau" target="_blank"><i class="fa-brands fa-soundcloud"></i></a></li>
                    <li class="icon-wrap"><a href="<?= get_option('tiktok_link') ?>" target="_blank"><i class="fa-brands fa-tiktok"></i></a></li>
                    <li class="icon-wrap"><a href="https://www.discogs.com/seller/starmint/profile" target="_blank"><i><img class="discogs-icon" src="${discogsUrl}"></i></a></li>
                </ul>
            </div>
            </div>


            `
    }

    constructor() {
        super()

        this.playedTracks = []
        this.isPlaying = false

        this.settings = {
            repeat: false,
            shuffle: false,
        }

        this.innerHTML = this.template

        this.currentTrack.addEventListener('player-controls', e => {
            switch (e.detail.action) {
                case "play":
                    this.toggle()
                    break
                case "next":
                    this.next()
                    break
                case "repeat":
                    this.currentTrack.buttons.repeat.classList.toggle('button--is-active')
                    this.settings.repeat = !this.settings.repeat
                    break
                case "shuffle":
                    this.currentTrack.buttons.shuffle.classList.toggle('button--is-active')
                    this.settings.shuffle = !this.settings.shuffle
                    break
                case "back":
                    this.back()
                    break
                case "progress-bar":
                    this.audio.currentTime = this.audio.duration * e.detail.progress
                    break
            }
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
            this.next();
        })
    }



    get currentTrack() {
        return this.querySelector('current-track')
    }

    // get isPlaying() { return !this.audio.paused && this.audio.duration > 0; }

    get title() { return this.querySelector('#audio-player-main-title') }

    get audio() { return this.querySelector('audio') }

    get playlist() { return this.querySelector('#playlist') }

    get isEmpty() {
        return this.playlist.querySelector('ag-track') == null
    }

    toggle() {
        this.isPlaying = !this.isPlaying
        this.isPlaying ? this.play() : this.pause()
    }

    play() {
        this.audio.play()
        this.isPlaying = true
        this.currentTrack.buttons.play.classList.add('button--is-active')

        this.intervalId = setInterval(e => {
            let percent = 100 * this.audio.currentTime / this.audio.duration
            this.currentTrack.progress = percent
        }, 1000)
    }

    pause() {
        this.audio.pause()
        this.isPlaying = false
        this.currentTrack.buttons.play.classList.remove('button--is-active')

        clearInterval(this.intervalId)

    }

    contains(href) {

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
            let current = this.querySelector('.track--current')

            if (current) {
                res = this.querySelector('.track--current ~ .track--future')
            } else {
                res = this.querySelector('.track--future')
            }
        }
        return res;
    }

    next(nextTrack = null) {

        let next = nextTrack ? nextTrack : this.nextTrack

        let current = this.querySelector('.track--current')

        if (current) {
            this.playedTracks.push(current.dataset.postId)
            current.classList.remove('track--current')
        }

        if (next !== null) {

            next.classList.remove('track--future', 'track--previous');

            this.renderCurrent(next)

            next.classList.add('track--previous', 'track--current');

            if (this.settings.shuffle == false) {
                this.playlist.scrollTo({
                    top: next.offsetTop + next.offsetHeight,
                    behavior: "smooth"
                })
            }

            if (this.isPlaying) this.play()

        } else {
            // Tous les morceaux ont été joués, réinitialise la playlist
            this.querySelectorAll('.track--previous').forEach(e => {
                e.classList.remove('track--previous')
                e.classList.add('track--future')
            })
            this.playedTracks = []
            if (this.settings.repeat) {
                this.isPlaying = this.isPlaying && this.settings.repeat
            } else {
                // TODO c'est sale mais ça marche
                let buttons = document.querySelectorAll('.button-play i');
                buttons.forEach(i => {
                    i.classList.remove('fa-pause');
                    i.classList.add('fa-play');
                });
                this.isPlaying = false
            }
            this.next()
        }

    }

    back() {
        if (this.playedTracks.length == 0) { return }
        let id = this.playedTracks.pop()

        let track = this.playlist.querySelector(`ag-track[data-post-id="${id}"]`)
        let current = this.querySelector('.track--current')

        if (current) {
            current.classList.remove('track--current')
            current.classList.add('track--future')
        }

        if (track) {
            track.classList.remove('track--previous')
            this.renderCurrent(track)
            track.classList.add('track--current')
        }

        if (this.isPlaying) this.play()
    }

    renderCurrent(track) {
        this.audio.src = track.dataset.src
        this.currentTrack.update(track.data)
    }

    update(playlistData) {
        let wasPlaying = this.isPlaying

        if (playlistData.content.length > 0) {
            // update title
            let title = playlistData.title
            this.title.innerHTML = title[0].toUpperCase() + title.slice(1);
            // update playlist
            this.clear()
            playlistData.content.forEach(e => {
                let track = this.add(e)

                // if playlist contains current song, place first
                if (this.currentTrack.dataset.postId == track.dataset.postId) {
                    track.remove()
                    if(this.playlist.firstChild!==null){
                        this.playlist.firstChild.before(track)
                    }else{
                        this.playlist.appendChild(track)
                    }
                    track.classList.add('track--current')
                }
            });

            // keep reading current song
            if (!this.isPlaying || document.querySelector('body').clientWidth < 850) {
                this.next()
            }

            if (wasPlaying) this.play()
        } else {
            this.title.innerHTML = "Aucun résultat"
            this.clear()
        }
    }

    clear() {
        this.playedTracks = []
        this.playlist.innerHTML = ''
        // this.dataset["current"] = 0
        // this.dataset["playing"] = false
    }

    unshift(trackData) {
        let track = AgTrack.get(trackData)
        track.classList.add('track--future')
        track.addEventListener('click', e => this.dispatchEvent(new CustomEvent('track-click', { detail: { post_id: track.dataset.postId } })))
        this.playlist.appendChild(track)
    }

    add(trackData, append = true) {
        let track = AgTrack.get(trackData)
        track.classList.add('track--future')
        track.addEventListener('click', e => this.dispatchEvent(new CustomEvent('track-click', { detail: { post_id: track.dataset.postId } })))

        let nextTrack = this.playlist.querySelector('.track--future')

        if (append || !nextTrack) {
            this.playlist.appendChild(track)
        } else {
            nextTrack.before(track)
            this.next()
        }
        return track
    }

}



