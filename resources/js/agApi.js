export const AgApi = {

    url: frontend.homeUrl + '/wp-json/africangrooves/v1/post/',

    fetch: async function (action, data = {}) {
        let res = await fetch(this.url, {
            method: "post",
            mode: "cors",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: action,
                ...data
            })
        })

        return res.json()
    },

    fetchContent: function (url) {
        return this.fetch('fetch_content', { url: url })
    },

    fetchSearch: function (s) {
        return this.fetch('search', { search: s })
    },

    getSongsByRegion: function (region) {
        return this.fetch('region', { region: region })
    },

    getTracks: function (url = '') {
        url = url.replace('/index.php', '')
        return this.fetch('last_tracks')
    },

    getSongPost: function (id) {
        return this.fetch('song_post', { id: id })
    },

    fetchTrack: function (id) {
        return this.fetch('track', { id: id })
    }



}