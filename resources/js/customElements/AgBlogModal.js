import vinylUrl from '/img/vinyl_white.svg'

export class AgBlogModal extends HTMLElement {

    get template() {
        return `
            <div class="modal-loader">
                <div class="img-wrap">
                <img src="${vinylUrl}" alt="">

                </div>
            </div>
            <button id="post-close-button" class="icon-wrap modal-close"><i class="fa-solid fa-x"></i></button>
            <div class="slot">test</div>
    `
    }

    constructor() {
        super()
        this.content = ''
        this.innerHTML = this.template
        this.querySelector('button').onclick = e => {
            this.classList.remove('is-visible')
        }
    }

    setContent(val) {
        this.querySelector('.slot').innerHTML = val
    }

}