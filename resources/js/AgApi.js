export let AgApi = {
    test: function () {
        fetch('/wp-json/africangrooves/v1/tracks/recent', {
            method: 'GET',
            credentials: 'same-origin',
            headers: new Headers({
                'Content-Type': 'application/json;charset=UTF-8',
            }),
            args:{
                arg1:'arg1'
            }
        }).then(response => response.json()
        .then(e=>console.log(e))
        
        );
    },
    run: function () {
        // Extend wp.api.models.Post and wp.api.collections.Posts to load a custom post type

        const CustomPost = wp.api.models.Post.extend({
            urlRoot: wpApiSettings.root + 'wp/v2/song',
            defaults: {
                type: 'song',
            },
        });

        const CustomPosts = wp.api.collections.Posts.extend({
            url: wpApiSettings.root + 'wp/v2/song',
            model: CustomPost,
        });

        //tracks

        const Track = wp.api.models.Post.extend({
            urlRoot: wpApiSettings.root + 'wp/v2/africangrooves/v1/song/1',
            defaults: {
            },
        });

        const Tracks = wp.api.collections.Posts.extend({
            url: wpApiSettings.root + 'wp/v2/africangrooves',
            model: Track,
        });

        const someCustomPosts = new CustomPosts();
        someCustomPosts.fetch().then((posts) => {
            console.log(posts)
        });
    }
}