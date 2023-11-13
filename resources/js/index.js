/*  TODO  //////////////////////////////////////////////////////////////////

clic sur carte ferme modal
ouverture modal ferme menus
polices ne s affichent pas dans chrome
ordre affichage éléments loading
modifier player de post dans modal


//    /////////////////////////////////////////////////////////////////*/

import '../css/index.scss';

import { PanZoom } from "./panzoom.js";

// import { worldmapInit } from './AgWorldmap/AgWorldMap.js';

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

   player.querySelector('#playlist-toggle-button').onclick = e => player.classList.toggle("is-open")

   // panzoom init

   let svg = document.querySelector("ag-worldmap svg")
   new PanZoom(svg).init();

   // country click action
   svg.addEventListener("click", e => {
      if (e.target.localName == "path" && e.target.dataset.count > 0) {
         let country = e.target.dataset.name
         player.fetch('wp-json/africangrooves/v1/tracks/region/', { region: country })
      }
   })

   // song display action
   player.controls.buttons.plus.onclick = e => {
      let id = player.currentTrack.dataset.postId

      // modal.fetch(`wp-json/africangrooves/v1/song/${id}`, {}, e => {
      //    return e.replace(/<audio.*audio>/s, 'test')
      // })

      modal.displayLoader()
      fetch(`wp-json/africangrooves/v1/song/${id}`)
         .then(e => e.json())
         .then(e => {
            modal.displayContent(e)
         })
   }

   // track click action
   player.addEventListener('track-click', e => {
      let id = e.detail.post_id

      modal.displayLoader()
      fetch(`wp-json/africangrooves/v1/song/${id}`)
         .then(e => e.json())
         .then(e => {
            modal.displayContent(e)
         })
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

   // loader
   loaded = true;
   if (elapsed) {
      hideLoadingScreen();
   }
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