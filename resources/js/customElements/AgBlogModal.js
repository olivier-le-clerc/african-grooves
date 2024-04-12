import vinylUrl from '/img/vinyl.svg'
import { alert } from '../alert'

export class AgBlogModal extends HTMLElement {

  #endpoint
  #currentPage

  get template() {
    return `
            <div class="modal-loader">
                <div class="img-wrap">
                <img src="${vinylUrl}" alt="">
                </div>
            </div>
            <button id="post-share-button" class="icon-wrap modal-control modal-control__share"><i class="fa-solid fa-arrow-up-right-from-square"></i></button>
            <button id="post-close-button" class="icon-wrap modal-control modal-control__close"><i class="fa-solid fa-x"></i></button>
            <div class="slot">
            </div>
            <!-- </div> -->
    `
  }

  constructor() {
    super()
    let content = this.innerHTML

    this.innerHTML = this.template
    this.slot.innerHTML = content
    this.querySelector('#post-close-button').onclick = e => {
      this.close()
    }
    this.querySelector('#post-share-button').onclick = e => {
      let url = window.location.href
      navigator.clipboard.writeText(url).then(e => alert("page adress copied to clipboard"))
    }
    // infinite scrolling observer
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.target.classList.contains("song-post") && entry.isIntersecting) {
          observer.unobserve(entry.target)
          this.#currentPage++
          this.fetch()
        }
      })
    })
    //event listener
    window.addEventListener('blog-load-content',(e)=>{
      console.log(e.detail.url)
      this.load(e.detail.url)
    })
  }

  load(url = this.#endpoint) {
    this.#endpoint = url
    this.#currentPage = 1
    this.clear()
    this.displayLoader()
    this.fetch()
  }

  fetch() {
    let isLastPage;
    fetch(frontend.homeUrl + '/wp-json/africangrooves/v1/from-url', {
      method: "post",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: this.#endpoint,
        args: {
          paged: this.#currentPage
        }
      })
    })
      .then(e => {
        isLastPage = e.headers.get('W-WP-TotalPages') <= this.#currentPage;
        return e.json()
      })
      .then(e => {
        this.addContent(e)
        if (!isLastPage) {
          let lastElement = this.slot.lastElementChild
          this.observer.observe(lastElement)
        }
        this.hideLoader()
      })
      .catch(e => {
        this.close()
      })
  }

  get slot() {
    return this.querySelector('.slot')
  }

  displayLoader() {
    this.classList.remove('is-visible')
    this.classList.add('is-loading')
    this.dispatchEvent(new CustomEvent('blog-modal-opened'))
  }

  hideLoader() {
    this.classList.add('is-visible')
    this.classList.remove('is-loading')
  }

  copyToClipboard(string) {
    navigator.clipboard.writeText(string);
    alert('url copied to clipboard')
  }

  // displayContent(str, callback = e => e) {
  //   let content = callback(str)
  //   this.setContent(content)
  //   this.classList.add('is-visible')
  //   this.classList.remove('is-loading')
  // }

  // get isVisible() {
  //   return this.classList.contains('is-visible') || this.classList.contains('is-loading')
  // }

  clear() {
    this.slot.innerHTML = ''
    this.slot.scrollTo(0, 0)
  }

  close() {
    this.clear()
    this.classList.remove('is-visible', 'is-loading')
    this.dispatchEvent(new CustomEvent('blog-modal-closed'))
  }

  addContent(val) {
    this.slot.innerHTML += val;
    //open external links in a new tab
    Array.from(this.querySelectorAll('a'))
      .filter(e => !e.href.includes(frontend.homeUrl))
      .forEach(a => a.target = "_blank")
  }
}
