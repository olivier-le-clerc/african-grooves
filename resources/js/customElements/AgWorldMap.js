import mapUrl from '/img/world-map.svg'

let map = await fetch(mapUrl).then(e => e.text())
let data = await fetch(frontend.homeUrl + '/themes/africangrooves/cache/dynamic_map_data.json').then(r => r.json())

let interval = 0

export class AgWorldMap extends HTMLElement {
    constructor() {
        super()

        this.innerHTML = map
        this.querySelectorAll("#map path").forEach(el => {
            let key = data.states[el.id] ? el.id : "default"
            for (let att in data.states[key]) {
                el.dataset[att] = data.states[key][att];
            }
        })

        //  Tooltip on Hover  //////////////////////////////////////////////////////////////////

        let tooltip = document.createElement('div');
        tooltip.classList.add('tooltip')
        tooltip.innerHTML = ''

        this.onclick = e =>{
            if (e.target.dataset.count > 0) {

                clearInterval(interval)
                this.querySelector('.highlight')?.classList.remove('highlight')
                interval = setInterval(el=>e.target.classList.toggle('highlight'),500)

            }

        }

        this.onmousemove = e => {
            if (e.target.dataset.count > 0) {

                let name = e.target.dataset.name
                if (tooltip.innerHTML !== name) {
                    this.appendChild(tooltip)
                    tooltip.innerHTML = name
                }
                tooltip.style.top = e.clientY + 10 + 'px'
                tooltip.style.left = e.clientX + 10 + 'px'
            }
        }

        this.onmouseout = e => {
            tooltip.innerHTML = ''
            if (this.querySelector('.tooltip')) {
                this.removeChild(tooltip)
            }
        }

    }
}