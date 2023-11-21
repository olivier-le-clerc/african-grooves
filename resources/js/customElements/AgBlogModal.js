import vinylUrl from '/img/vinyl.svg'

export class AgBlogModal extends HTMLElement {

    get template() {
        return `
            <div class="modal-loader">
                <div class="img-wrap">
                <img src="${vinylUrl}" alt="">

            </div>
            </div>
                <button id="post-close-button" class="icon-wrap modal-close"><i class="fa-solid fa-x"></i></button>
                <div class="slot"></div>
    `
    }

    constructor() {
        super()
        this.content = ''

        let content = this.innerHTML

        this.innerHTML = this.template
        this.querySelector(".slot").innerHTML = content
        this.querySelector('button').onclick = e => {
            this.clear()
        }
    }

    displayLoader() {
        this.classList.remove('is-visible')
        this.classList.add('is-loading')
        this.dispatchEvent(new CustomEvent('blog-modal-opened'))
    }

    displayContent(str, callback = e => e) {
        let content = callback(str)
        this.setContent(content)
        let slot = this.querySelector('.slot')
        this.classList.add('is-visible')
        this.classList.remove('is-loading')
        slot.scrollTo(0, 0)
    }

    get isVisible() {
        return this.classList.contains('is-visible') || this.classList.contains('is-loading')
    }

    clear() {
        this.classList.remove('is-visible', 'is-loading')
        this.setContent('')
        this.dispatchEvent(new CustomEvent('blog-modal-closed'))
    }

    setContent(val) {
        this.querySelector('.slot').innerHTML = val
    }
}