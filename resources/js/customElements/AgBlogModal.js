import vinylUrl from '/img/vinyl.svg'


export class AgBlogModal extends HTMLElement {

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
            </div>
    `
    }

    constructor() {
        super()
        this.content = ''

        let content = this.innerHTML

        this.innerHTML = this.template
        this.querySelector(".slot").innerHTML = content
        this.querySelector('#post-close-button').onclick = e => {
            this.clear()
        }
        this.querySelector('#post-share-button').onclick = e => {
            let url = window.location.href
            this.copyToClipboard(url)
        }
    }

    copyToClipboard(url){
        navigator.clipboard.writeText(url).then(e=>this.alert("page adress copied to clipboard"))
    }

    alert(str){
        let alert = document.createElement('div')
        alert.classList.add('alert')
        alert.innerHTML = `<p>${str}</p>`
        document.body.appendChild(alert)
        // setTimeout(()=>document.body.removeChild(alert),2000)
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

    get lastElement(){
        return this.querySelector('.slot').lastElementChild
    }

    clear() {
        this.classList.remove('is-visible', 'is-loading')
        this.setContent('')
        this.dispatchEvent(new CustomEvent('blog-modal-closed'))
    }

    setContent(val) {
        this.querySelector('.slot').innerHTML = val
        this.openExternalLinksInAnewTab()
        this.dispatchEvent(new CustomEvent('modal-updated',{detail:{lastElement:this.lastElement}}))
    }

    openExternalLinksInAnewTab() {
        Array.from(this.querySelectorAll('a'))
            .filter(e => !e.href.includes(frontend.homeUrl))
            .forEach(a => a.target = "_blank")
    }
}