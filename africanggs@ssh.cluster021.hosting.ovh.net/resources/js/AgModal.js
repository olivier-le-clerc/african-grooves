export class AgModal extends HTMLElement {

    get content(){
        return this.querySelector('#article-body')
    }

    get closeButton(){
        return this.querySelector('#post-close-button')
    }

    constructor() {
        super()

        this.classList.add('modal-container')

        this.innerHTML = `
            <div class="modal-background" onclick="closeModal()"></div>
            <div class="modal-loader">
                <div class="img-wrap">
                    <img src="<?= get_stylesheet_directory_uri() . '/assets/img/vinyl.svg' ?>" alt="">
                </div>
            </div>
            <div class="modal-card">
                <button id="post-close-button" class="icon-wrap modal-close" onclick="closeButton()"><i class="fa-solid fa-x"></i></button>
                <div id="article-body" class="article-body">
                </div>
            </div>
        `

    }
}