/*  TODO  //////////////////////////////////////////////////////////////////

modifier player de post dans modal

appui sur bouton info > enlever player dans modal

//  non bloquants  //////////////////////////////////////////////////////////////////

reprendre css article

//    /////////////////////////////////////////////////////////////////*/

import '../css/index.scss';
import { init } from './app.js';

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

// pageSetup()
      init()
      loaded = true;

if (elapsed) {
   hideLoadingScreen();
}

function hideLoadingScreen() {
   document.querySelectorAll('.show-when-loaded').forEach(e => e.classList.remove('show-when-loaded'));
   document.querySelector('#loader').classList.add('loaded');
}