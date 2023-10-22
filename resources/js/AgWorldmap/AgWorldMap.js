import mapUrl from '/img/world-map.svg'

let map = await fetch(mapUrl).then(e => e.text())
let data = await fetch('themes/africangrooves/cache/dynamic_map_data.json').then(r => r.json())


export function worldmapInit() {
    customElements.define('ag-worldmap', class extends HTMLElement {
        constructor() {
            super()
            this.innerHTML = map
            this.querySelectorAll("#map path").forEach(el => {
                let key = data.states[el.id] ? el.id : "default"
                for (let att in data.states[key]) {
                    el.dataset[att] = data.states[key][att];
                }
            })
        }
    })
}