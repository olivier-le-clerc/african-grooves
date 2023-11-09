import '../css/index.scss';

import { PanZoom } from "./panzoom.js";

// import { worldmapInit } from './AgWorldmap/AgWorldMap.js';

import { AgWorldMap } from './customElements/AgWorldMap'
customElements.define('ag-worldmap', AgWorldMap)

import { AgAudioPlayer } from './customElements/AgAudioPlayer/AgAudioPlayer';
customElements.define('ag-audio-player', AgAudioPlayer)

import { AgBlogModal } from './customElements/AgBlogModal';
customElements.define('ag-blog-modal', AgBlogModal)

// import { AgApi } from './AgApi';
// AgApi.test()

///// LOADER SCREEN

const MIN_TIME_MS = 2;

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

   // get last tracks
   fetch('wp-json/africangrooves/v1/tracks/recent')
      .then(e => e.json())
      .then(e => player.update(e))

   let player = document.querySelector('ag-audio-player')
   let modal = document.querySelector('ag-blog-modal')


   player.querySelector('#playlist-toggle-button').onclick = e => player.classList.toggle("is-open")

   // panzoom init
   let svg = document.querySelector("ag-worldmap svg")
   new PanZoom(svg).init();

   // country click action
   svg.addEventListener("click", e => {
      if (e.target.localName == "path" && e.target.dataset.count > 0) {
         let country = e.target.dataset.name

         fetch('wp-json/africangrooves/v1/tracks/region/', {
            method: 'post',
            headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               region: country
            })
         })
            .then(e => e.json())
            .then(e => player.update(e))
      }
   })

   // song display action
   player.controls.buttons.plus.onclick = e => {
      let id = player.currentTrack.dataset.postId

      modal.classList.add('is-loading')
      fetch(`wp-json/africangrooves/v1/song/${id}`)
         .then(e => e.json())
         .then(e => modal.setContent(e))
         .then(e => {

            // remplace le lecteur
            let audio = modal.querySelector('audio');
            if (audio !== null) {
               // audio player replacement
               let button = document.createElement('button');
               button.classList.add('player-button', 'button--big', 'button-play', 'button--contrast');
               if (player.isPlaying) {
                  button.innerHTML = '<i class="fa-solid fa-pause"></i>';
               } else {
                  button.innerHTML = '<i class="fa-solid fa-play"></i>';
               }
               button.addEventListener('click', player.toggle);
               audio.replaceWith(button);
            }

            modal.classList.remove('is-loading')
            modal.classList.add('is-visible')
         })
   }

   // search form
   let searchBar = document.querySelector('#navbar-search')
   searchBar.querySelector('button').addEventListener('click', e => {
      e.preventDefault()

      let input = searchBar.querySelector('input')
      let s = input.value
      input.value = ''

      fetch('wp-json/africangrooves/v1/search/', {
         method: 'post',
         headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            search: s
         })
      }).then(e => e.json())
         .then(e => {
            player.update(e)
            // TODO gerer pas de résultats
         })
      })

      // internal links open in modal
      window.addEventListener('click', e => {

         let link = e.target.href ?? null

         if (link && link.includes(document.location)) { // lien interne au site
            e.preventDefault()

            modal.setContent('')
            modal.classList.add('is-loading');

            fetch(link)
               .then(e => e.text())
               .then(e => {
                  let regex = /<main>.*<\/main>/s
                  let res = e.match(regex)[0] ?? null
                  if (res) {
                     modal.setContent(res)
                     modal.classList.add('is-visible')
                  }
                  modal.classList.remove('is-loading')
               })
               .catch(e => modal.classList.remove('is-visible'))
               .finally(e => modal.classList.remove('is-loading'))
         }
      })

      // loader
      loaded = true;
      if (elapsed) {
         hideLoadingScreen();
      }
   }