/*  TODO  //////////////////////////////////////////////////////////////////

polices ne s affichent pas dans chrome
modifier player de post dans modal

//  non bloquants  //////////////////////////////////////////////////////////////////

reprendre css article

//    /////////////////////////////////////////////////////////////////*/

import '../css/index.scss';

import { PanZoom } from "./panzoom.js";

import { AgWorldMap } from './customElements/AgWorldMap'
customElements.define('ag-worldmap', AgWorldMap)

import { AgAudioPlayer } from './customElements/AgAudioPlayer/AgAudioPlayer';
customElements.define('ag-audio-player', AgAudioPlayer)

import { AgBlogModal } from './customElements/AgBlogModal';
customElements.define('ag-blog-modal', AgBlogModal)

///// LOADER SCREEN

const MIN_TIME_MS = 2000;

var elapsed = false;
var loaded = false;

setTimeout(function () {
   elapsed = true;
   if (loaded) {
      hideLoadingScreen();
   }
}, MIN_TIME_MS);

pageSetup()
loaded = true;

if (elapsed) {
   hideLoadingScreen();
}

function hideLoadingScreen() {
   document.querySelectorAll('.show-when-loaded').forEach(e => e.classList.remove('show-when-loaded'));
   document.querySelector('#loader').classList.add('loaded');
}

///// LOADING ROUTINE


function pageSetup() {

   let player = document.querySelector('ag-audio-player')
   let modal = document.querySelector('ag-blog-modal')

   // get last tracks
   fetch('wp-json/africangrooves/v1/tracks/recent')
      .then(e => e.json())
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
         player.fetch('wp-json/africangrooves/v1/tracks/region/', { region: country })
      }
   })

   // song infos modal display
   player.controls.buttons.plus.onclick = e => {
      let id = player.currentTrack.dataset.postId
      modal.fetch(`wp-json/africangrooves/v1/song/${id}`)
   }

   // disable map controls and closes menus when modal opened
   modal.addEventListener('blog-modal-opened', e => {
      document.querySelector('#map-ui').classList.add('disableMap')
      player.classList.remove('is-open')
      closeAllDrawers()
   })

   modal.addEventListener('blog-modal-closed', e => document.querySelector('#map-ui').classList.remove('disableMap'))

   // click on map closes modal when opened
   document.querySelector('#map-ui').addEventListener('click', e => {
      if (e.target.id == 'map-ui')
         modal.clear()
   })

   // track click action
   player.addEventListener('track-click', e => {
      let id = e.detail.post_id
      modal.fetch(`wp-json/africangrooves/v1/song/${id}`)
   })

   // search form
   let searchBar = document.querySelector('#navbar-search')
   searchBar.querySelector('button').addEventListener('click', e => {
      e.preventDefault()

      let input = searchBar.querySelector('input')
      let s = input.value == '' ? 'recent' : input.value
      input.value = ''

      player.fetch('wp-json/africangrooves/v1/search/', { search: s })
   })

   // internal links open in modal
   document.querySelector('#map-ui').addEventListener('click', e => {

      let link = e.target.href ?? null

      if (link && link.includes(document.location.href) && !link.includes('wp-admin')) { // lien interne au site
         e.preventDefault()

         link = link.replace(document.location.href, '')
         link = link.replace('index.php', '')
         modal.displayLoader()
         agFetch({ action: 'fetch_content', url: link })
            .then(e => modal.displayContent(e))
            .catch(e => modal.clear())
      }
   })
}

async function agFetch(args) {
   let res = await fetch('wp-json/africangrooves/v1/post/', {
      method: "post",
      mode: "cors",
      credentials: "same-origin",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify(args)
   })
   return res.json()
}

function closeAllDrawers() {
   document.querySelectorAll('input[type=checkbox]').forEach(e => e.checked = false)
}