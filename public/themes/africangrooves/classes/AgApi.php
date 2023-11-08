<?php

class AgApi
{

    const POST_LIMIT = 20;

    static function init()
    {
        add_action('rest_api_init', function () {

            //  Search by country  //////////////////////////////////////////////////////////////////
            register_rest_route('africangrooves/v1', '/tracks/region/', [
                'methods' => 'POST',
                'callback' => function (WP_REST_Request $req) {
                    $search = $req->get_json_params()['region'];
                    return get_tracks($search, 'region');
                },
            ]);

            //  Recent tracks  //////////////////////////////////////////////////////////////////

            register_rest_route('africangrooves/v1', '/tracks/recent', [
                'methods' => 'GET',
                'callback' => function () {
                    return get_tracks();
                },
            ]);

            //  Song  //////////////////////////////////////////////////////////////////

            register_rest_route('africangrooves/v1', '/song/(?P<id>[0-9]+)', [
                'methods' => 'GET',
                'callback' => function (WP_REST_Request $req) {
                    return get_song($req->get_param('id'));
                },
            ]);

            //  Url  //////////////////////////////////////////////////////////////////

            register_rest_route('africangrooves/v1', '/url/', [
                'methods' => 'POST',
                'callback' => function (WP_REST_Request $req) {
                    $url = $req->get_json_params()['url'];

                    if ($url) {
                        $query = new WP_Query($url);
                        return $query->get_posts();
                    }
                },
            ]);
        });
    }
}
