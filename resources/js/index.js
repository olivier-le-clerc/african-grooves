import '../css/index.scss';

import { PanZoom } from "./panzoom.js";

import { agAudioPlayer } from './AgAudioPlayer/AgAudioPlayer';

let player = agAudioPlayer()

import { worldmapInit } from './AgWorldmap/AgWorldMap.js';

// let res =  wp.api.utils

// AJAX LOAD //////////////////////////////////////////////////////////////////////

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

      // populate map with dynamic data
      worldmapInit()
      // audio player
      ajax_get_tracks()
      player.querySelector('#playlist-toggle-button').addEventListener("click",togglePlaylist)

      // display content

      // panzoom init
      let svg = document.querySelector("ag-worldmap svg")
      new PanZoom(svg).init();
      // country click action
      svg.addEventListener("click", e => {
         if (e.target.localName == "path" && e.target.dataset.count > 0) {
            let country = e.target.dataset.name
            ajax_get_tracks(country)
         }
      })

      // window.postModal = postModal
      // window.closeModal = closeModal
      // window.closeButton = closeButton

      // loader

      loaded = true;
      if (elapsed) {
         hideLoadingScreen();
      }
}

// MUSIC PLAYER  //////////////////////////////////////////////////////////////////////

// let audioPlayer = document.querySelector('ag-audio-player')
// let audio = audioPlayer.querySelector('audio');
// let title = audioPlayer.querySelector('#audio-player-main-title');

function initAudioPlayer() {
   player.audio.addEventListener('playing', e => {
      let buttons = document.querySelectorAll('.button-play i');
      buttons.forEach(i => {
         i.classList.remove('fa-play');
         i.classList.add('fa-pause');
      });

   });

   player.audio.addEventListener('pause', e => {
      let buttons = document.querySelectorAll('.button-play i');
      buttons.forEach(i => {
         i.classList.remove('fa-pause');
         i.classList.add('fa-play');
      });
   });

   player.audio.addEventListener('ended', e => {
      next();
      audio.play();
   })

   ajax_get_tracks()
}

function ajax_get_tracks(search_string = 'recent', taxonomy = '') {
   jQuery.ajax({
      type: "POST",
      dataType: "json",
      url: frontend.ajaxUrl,
      data: {
         action: "tracks",
         taxonomy: taxonomy,
         search: search_string,
      },
      success: function (data) {
         player.update(data);
      },
   });
}

//  MODAL  /////////////////

function postModal() {
   let modal = document.querySelector("#post-modal");
   let id = document.querySelector("#current-song").dataset['id'];
   modal.classList.add('is-loading');

   jQuery.ajax({
      type: "POST",
      dataType: "json",
      url: frontend.ajaxUrl,
      timeout: 3000,
      data: {
         action: "post",
         id: id,
      },
      success: function (data) {
         update_modal(data.content);
      },
      error: function () {
         modal.classList.remove('is-loading');
      }
   });
}

function closeButton() {
   const isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));
   if (isMobile) {
      history.back();
   } else {
      closeModal();
   }
}

function closeModal() {
   let modal = document.querySelector("#post-modal");
   modal.classList.remove('is-active', 'is-loading');
}

function update_modal(content) {
   let modal = document.querySelector("#post-modal");
   let e = document.querySelector("#article-body");
   e.innerHTML = content;

   let audio = e.querySelector('audio');
   if(audio !==null){
   // audio player replacement
   let button = document.createElement('button');
   button.classList.add('player-button', 'button--big', 'button-play');
   if (isPlaying()) {
      button.innerHTML = '<i class="fa-solid fa-pause"></i>';
   } else {
      button.innerHTML = '<i class="fa-solid fa-play"></i>';
   }
   button.addEventListener('click', playPause);
   audio.replaceWith(button);
   }


   // change le comportement de la touche retour sur mobile
   const isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));
   if (isMobile) {
      if (window.history && window.history.pushState) {
         history.pushState('modalShow', '', "");
         window.onpopstate = (e) => {
            e.stopPropagation();
            e.preventDefault();
            closeModal();
            window.onpopstate = () => { };
         }
      }
   }
   modal.classList.remove('is-loading');
   modal.classList.add('is-active');
}

////////////////////////////

console.log(document.querySelector("#playlist-toggle-button"))

function togglePlaylist() {
   let button = document.querySelector("#playlist-toggle-button");
   // let player = document.querySelector("#audio-player");
   button.classList.toggle("is-open");
   player.classList.toggle("is-open");
}

let navbar = document.querySelectorAll("#site-header a")
navbar.forEach(e=>{
   e.addEventListener('click',(i)=>{
      i.preventDefault()
      let search = i.target.href

      let modal = document.querySelector("#post-modal");
      let id = document.querySelector("#current-song").dataset['id'];
      modal.classList.add('is-loading');
   
      jQuery.ajax({
         type: "POST",
         dataType: "json",
         url: frontend.ajaxUrl,
         timeout: 3000,
         data: {
            action: "content",
            url: search
         },
         success: function (data) {
            console.log(data)
            update_modal(data[0].post_content);
         },
         error: function () {
            console.log('fail')
            modal.classList.remove('is-loading');
         }
      });
   })})
