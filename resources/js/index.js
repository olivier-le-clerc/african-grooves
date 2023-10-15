import '../css/index.scss';

import { PanZoom } from "./panzoom.js";

const test=()=>console.log('salut')

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
   jQuery(document).ready(function () {
      // populate map with dynamic data

      populateMap()

      // display content

      let svg = document.querySelector("#worldmap svg")
      new PanZoom(svg).init();
      initAudioPlayer()

      window.playPause = playPause
      window.next = next
      window.postModal = postModal
      window.closeModal = closeModal
      window.closeButton = closeButton

      // loader

      loaded = true;
      if (elapsed) {
         hideLoadingScreen();
      }
   })
}

// MAP FUNCTIONS  //////////////////////////////////////////////////////////////////////

// export class PanZoom {

//    zoomVals = { step: 0.1, start: 1, min: 1, max: 100 }
//    MOVE_THRESHOLD = 5

//    constructor(svg) {
//       this.svg = svg
//       this.port = { w: this.svg.getAttribute("width"), h: this.svg.getAttribute("height") }
//       this.box = this.svg.viewBox.baseVal
//       this.distance = 0
//       this.pointers = {}
//       // run listeners
//       this.svg.addEventListener('resize', e => this.init());
//       this.svg.addEventListener('wheel', e => this.zoom(e));
//       this.svg.addEventListener('click', e => this.clickHandler(e), true);
//       this.svg.addEventListener('pointerdown', e => this.pointerDownHandler(e));
//       this.svg.addEventListener('pointermove', e => this.pointerMoveHandler(e));
//       this.svg.addEventListener('pointerup', e => this.pointerUpHandler(e));
//       this.svg.addEventListener('pointerleave', e => this.pointerUpHandler(e));
//    }

//    init() {
//       var ratio = this.svg.clientWidth / this.svg.clientHeight;
//       if (ratio < this.port.w / this.port.h) { // Offset X
//          this.box.height = this.port.h;
//          this.box.width = this.box.height * ratio;
//          this.box.x = (this.port.w - this.box.width) / 2;
//          this.box.y = 0;
//       } else { // Offset Y
//          this.box.width = this.port.w;
//          this.box.height = this.box.width / ratio;
//          this.box.x = 0;
//          this.box.y = (this.port.h - this.box.height) / 2;
//       }
//    }

//    hasMoved() {
//       return this.distance > this.MOVE_THRESHOLD;
//    }

//    clickHandler(e) {
//       if (this.hasMoved()) {
//          e.stopPropagation()
//       }
//    }

//    pointerDownHandler(e) {
//       this.pointers[e.pointerId] = { x: e.x, y: e.y, dx: 0, dy: 0 };
//       if (Object.keys(this.pointers).length === 1) {
//          this.distance = 0;
//       }
//    }

//    pointerUpHandler(e) {
//       delete this.pointers[e.pointerId];
//    }

//    pointerMoveHandler(e) {
//       if (Object.keys(this.pointers).length == 1) { // panning
//          let point = this.pointers[e.pointerId];
//          let scale = this.svg.clientWidth / this.box.width;
//          let [dx, dy] = [(point.x - e.x) / scale, (point.y - e.y) / scale];
//          this.distance++;
//          this.box.x += dx;
//          this.box.y += dy;
//          [point.x, point.y] = [e.x, e.y];
//       } else if (Object.keys(this.pointers).length == 2) { // tactile zoom
//          let point = this.pointers[e.pointerId];
//          let center = {
//             x: (this.pointers[Object.keys(pointers)[0]].x + this.pointers[Object.keys(pointers)[1]].x) / 2,
//             y: (this.pointers[Object.keys(pointers)[0]].y + this.pointers[Object.keys(pointers)[1]].y) / 2,
//          }
//          let [dx, dy] = [(point.x - e.x), (point.y - e.y)];
//          let delta = dx * (- 2 * center.x + point.x + e.x) + dy * (- 2 * center.y + point.y + e.y);

//          let wheelEvent = new WheelEvent('wheel', {
//             clientX: center.x,
//             clientY: center.y,
//             deltaY: delta,
//          });
//          [point.x, point.y] = [e.x, e.y];
//          this.svg.dispatchEvent(wheelEvent);
//       }
//    }

//    zoom(e) {
//       e.preventDefault();
//       let delta = - Math.sign(e.deltaY)
//          , [w, h] = [this.box.width, this.box.height]
//          , [mx, my] = [e.x, e.y]
//          , dw = w * delta * this.zoomVals.step
//          , dh = h * delta * this.zoomVals.step
//          , [dx, dy] = [dw * mx / this.svg.clientWidth, dh * my / this.svg.clientHeight];

//       if (this.port.w / this.zoomVals.max < this.box.width - dw && this.box.width - dw < this.port.w / this.zoomVals.min) {
//          this.box.x += dx;
//          this.box.y += dy;
//          this.box.width -= dw;
//          this.box.height -= dh;
//       }
//    }

// }

function populateMap() {
   jQuery.ajax({
      dataType: "json",
      url: `themes/africangrooves/cache/dynamic_map_data.json`,
      success: function (data) {
         // inserts map_data in svg code
         document.querySelectorAll("#map path").forEach((el) => {
            let key = data.states[el.id] !== undefined ? el.id : "default";
            for (let att in data.states[key]) {
               el.dataset[att] = data.states[key][att];
            }
            if (el.dataset["count"] > 0) {
               el.onclick = function () {
                  ajax_get_tracks(el.dataset["name"], 'region');

               }
            }
         });
      }
   });
}

// MUSIC PLAYER  //////////////////////////////////////////////////////////////////////

let audioPlayer = document.querySelector('#audio-player')
let audio = audioPlayer.querySelector('audio');
let title = audioPlayer.querySelector('#audio-player-main-title');

initAudioPlayer()

function initAudioPlayer() {
   audio.addEventListener('playing', e => {
      let buttons = document.querySelectorAll('.button-play i');
      buttons.forEach(i => {
         i.classList.remove('fa-play');
         i.classList.add('fa-pause');
      });

   });

   audio.addEventListener('pause', e => {
      let buttons = document.querySelectorAll('.button-play i');
      buttons.forEach(i => {
         i.classList.remove('fa-pause');
         i.classList.add('fa-play');
      });
   });

   audio.addEventListener('ended', e => {
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
         update_player(data);
      },
   });
}

function isPlaying() {
   return !audio.paused && audio.duration > 0;
}

function getTrackElement(data) {
   let track = document.querySelector('#track-template').content.firstElementChild.cloneNode(true)
   track.dataset.src = data.mp3_path
   track.dataset.id = data.id
   track.querySelector('.track-thumb').src = data.image_path;
   track.querySelector('.track-title').innerHTML = data.song_title
   track.querySelector('.track-artist').innerHTML = data.artist
   return track
}

function update_player(playlistData) {

   let wasPlaying = isPlaying()

   if (playlistData.content.length > 0) {

      // update title

      // let title = document.querySelector('#audio-player-main-title');
      title.innerHTML = playlistData.title;

      // first track

      let trackData = playlistData.content.shift();
      let firstTrack = getTrackElement(trackData);
      firstTrack.id = "current-song"
      audio.src = firstTrack.dataset.src;
      audioPlayer.querySelector("#current-song").replaceWith(firstTrack)

      // playlist

      let playlist = document.createElement("div")
      playlist.id = "playlist"

      playlistData.content.forEach(e => {
         let track = getTrackElement(e)
         track.querySelector('.controls').remove()
         track.classList.add("track--future")
         track.onclick = (e) => next(track)
         playlist.appendChild(track)
      });

      audioPlayer.querySelector("#playlist").replaceWith(playlist)

      if (wasPlaying) {
         audio.play()
      }
   }
}

function playPause() {
   if (isPlaying()) {
      audio.pause();
   } else {
      audio.play();
   }
}

function next(element = null) {

   let playing = isPlaying();
   let tracks = document.querySelector("#playlist");
   let next = tracks.querySelector('.track--future');
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
      let current = document.querySelector('#current-song');
      let controls = current.querySelector('.controls');
      current.innerHTML = next.innerHTML;
      current.dataset.mp3_path = next.dataset.mp3_path;
      current.dataset.id = next.dataset.id;
      current.querySelector('.track-infos').appendChild(controls);
      tracks.scrollTo(0, 0);
      audio.src = next.dataset.src;
      if (playing) audio.play();
   }
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

function togglePlaylist() {
   let button = document.querySelector("#playlist-toggle-button");
   let player = document.querySelector("#audio-player");
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
