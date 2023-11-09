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

    fetch(url, args = {}, callback = e => e, json = true) {
        this.setContent('')
        this.classList.add('is-loading')

        fetch(url, args)
            .then(e => json ? e.json() : e.text())
            .then(e => {
                e = callback(e)
                if (e) {
                    this.setContent(e)
                    this.classList.add('is-visible')
                }
            })
            .catch(e => this.classList.remove('is-visible'))
            .finally(e => this.classList.remove('is-loading'))
    }

}