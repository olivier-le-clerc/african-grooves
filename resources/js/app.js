let player, modal

import { PanZoom } from "./panzoom.js";

import { AgWorldMap } from './customElements/AgWorldMap'
customElements.define('ag-worldmap', AgWorldMap)

import { AgAudioPlayer } from './customElements/AgAudioPlayer/AgAudioPlayer';
customElements.define('ag-audio-player', AgAudioPlayer)

import { AgBlogModal } from './customElements/AgBlogModal';
customElements.define('ag-blog-modal', AgBlogModal)

import { AgApi } from "./agApi.js";

const defaultPlayerTitle = "Recent Tracks"

export function init() {

    player = document.querySelector('ag-audio-player')
    modal = document.querySelector('ag-blog-modal')

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

    // load content based on uri
    loadContent(window.location.href)

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
            svg.querySelector('.current')?.classList.remove('current')
            e.target.classList.add('current')
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
            loadContent(link)
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
        if (e.target.classList.contains('blog-button-share')){
            let url = e.target.dataset.src;
            modal.copyToClipboard(url)
        }
    })
}

function loadContent(url) {
    url = nicePath(url)
    renderPlayer(url)
    renderModal(url)
}

function nicePath(url) {
    let res = url.replace(frontend.homeUrl, '')
        .replace('index.php', '')
        .replace(/^\/+/, '').replace(/\/+$/, '')
    return res
}

async function renderModal(url) {
    if (!url) return
    modal.displayLoader()
    AgApi.fetchContent(url)
        .then(e => {
            modal.displayContent(e)

            // if audio player played, pause main player
            modal.querySelectorAll('audio').forEach(e => {
                // disable right click
                e.addEventListener('contextmenu',i=>{
                        i.preventDefault()
                })
                e.addEventListener('play', i => {
                    pauseOtherAudiosThan(e)
                    player.pause()
                })
            })
        })
        .catch(e => modal.clear())
}

async function renderPlayer(url) {
    // if region change playlist
    if (url.includes('region')) {
        let region = url.replace(/.*region\//, '').replace('/', '')
        AgApi.getSongsByRegion(region).then(e => player.update(e))
    } else if (player.isEmpty || player.title !== defaultPlayerTitle) {
        AgApi.getLastTracks().then(e => player.update(e))
    }
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
        .then(e => {
            window.history.pushState({ name: 'ag' }, 'ag-state', e.link)
            modal.displayContent(e.content)
        }
        )
        .catch(e => modal.clear())
}


