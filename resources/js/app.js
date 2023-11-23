let player, modal

import { PanZoom } from "./panzoom.js";

import { AgWorldMap } from './customElements/AgWorldMap'
customElements.define('ag-worldmap', AgWorldMap)

import { AgAudioPlayer } from './customElements/AgAudioPlayer/AgAudioPlayer';
customElements.define('ag-audio-player', AgAudioPlayer)

import { AgBlogModal } from './customElements/AgBlogModal';
customElements.define('ag-blog-modal', AgBlogModal)

import { AgApi } from "./agApi.js";


export function init() {

    player = document.querySelector('ag-audio-player')
    modal = document.querySelector('ag-blog-modal')

    // get last tracks
    AgApi.getLastTracks()
        .then(e => player.update(e))

    // toggle playlist drawer
    player.querySelector('#playlist-toggle-button').onclick = e => {
        closeAllDrawers()
        player.classList.toggle("is-open")
    }

    // panzoom init
    let svg = document.querySelector("ag-worldmap svg")
    new PanZoom(svg).init();

    // country click updates player action
    svg.addEventListener("click", e => {
        if (e.target.localName == "path" && e.target.dataset.count > 0) {
            let country = e.target.dataset.name
            AgApi.getSongsByRegion(country)
                .then(e => { player.update(e) })
        }
    })

    // song infos modal display
    player.currentTrack.buttons.plus.onclick = e => {
        let id = player.currentTrack.dataset.postId

        if (!player.isPlaying)
            player.play()

        displaySongPost(id)
    }

    // if player plays, pause all other audios

    player.audio.addEventListener('play', e => {
        pauseOtherAudiosThan(player.audio)
    })

    // track click action
    player.addEventListener('track-click', e => {
        let id = e.detail.post_id
        let track = player.playlist.querySelector(`ag-track[data-post-id="${id}"]`)

        if (player.currentTrack.dataset.postId !== id) {
            player.next(track)
        }

        if (!player.isPlaying)
            player.play()

        displaySongPost(id)
    })

    if (modal.classList.contains('is-visible')) {
        makeRoomForModal()
    }

    // disable map controls and closes menus when modal opened
    modal.addEventListener('blog-modal-opened', makeRoomForModal)

    function makeRoomForModal() {
        document.querySelector('#map-ui').classList.add('disableMap')
        player.classList.remove('is-open')
        closeAllDrawers()
    }

    modal.addEventListener('blog-modal-closed', e => {
        window.history.pushState({ name: 'ag' }, 'ag-state', frontend.homeUrl)
        document.querySelector('#map-ui').classList.remove('disableMap')
    })

    // click on map closes modal when opened
    document.querySelector('#map-ui').addEventListener('click', e => {
        if (e.target.id == 'map-ui')
            modal.clear()
    })

    // search form

    let searchBar = document.querySelector('#navbar-search')
    searchBar.querySelector('button').addEventListener('click', e => {
        e.preventDefault()
        let input = searchBar.querySelector('input')
        let s = input.value == '' ? 'recent' : input.value
        input.value = ''

        AgApi.fetchSearch(s).then(e => player.update(e))
    })

    // internal links open in modal
    document.querySelector('#map-ui').addEventListener('click', e => {

        let link = e.target.href ?? null
        if (link && link.includes(frontend.homeUrl) && !link.includes('wp-admin')) { // lien interne au site
            e.preventDefault()

            window.history.pushState({ name: 'ag' }, 'ag-state', link)

            link = link.replace(frontend.homeUrl, '')

            // if region change playlist
            if (link.includes('region')) {
                let region = link.replace(/.*region\//, '').replace('/', '')
                AgApi.getSongsByRegion(region).then(e => player.update(e))
            }

            link = link.replace('index.php', '')
            modal.displayLoader()
            AgApi.fetchContent(link)
                .then(e => {
                    modal.displayContent(e)

                    // if audio player played, pause main player

                    modal.querySelectorAll('audio').forEach(e => {
                        e.addEventListener('play', i => {
                            pauseOtherAudiosThan(e)
                            player.pause()
                        })
                    })
                })
                .catch(e => modal.clear())
        }
    })

    // link opened in modal have nice url, back button fix
    addEventListener("popstate", e => {
        if (e.state && e.state.name == 'ag') {
            history.back()
        } else {
            history.back()
        }
    })

    //click on modal play button
    modal.addEventListener('click', e => {
        if (e.target.classList.contains('blog-button-play')) {
            let id = e.target.dataset.post_id
            let track = player.playlist.querySelector(`[data-post-id="${id}"]`)
            if (track) {
                player.next(track)
            } else {
                AgApi.fetchTrack(id)
                    .then(e => player.add(e, 0))
            }
            player.play()
        }
    })


}

function pauseOtherAudiosThan(audio) {
    document.querySelectorAll('audio').forEach(f => {
        if (f !== audio) f.pause()
    })
}

function closeAllDrawers() {
    document.querySelectorAll('input[type=checkbox]').forEach(e => e.checked = false)
}

function displaySongPost(id) {
    modal.displayLoader()
    AgApi.getSongPost(id)
        .then(e => modal.displayContent(e))
        .catch(e => modal.clear())
}


