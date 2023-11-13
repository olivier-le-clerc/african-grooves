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
                    return SongPostType::get_song($req->get_param('id'));
                },
            ]);

            //  search  //////////////////////////////////////////////////////////////////

            register_rest_route('africangrooves/v1', '/search/', [
                'methods' => 'POST',
                'callback' => function (WP_REST_Request $req) {
                    $s = $req->get_json_params()['search'];
                    if ($s) {
                        return get_tracks($s);
                    }
                },
            ]);


            //  url  //////////////////////////////////////////////////////////////////

            register_rest_route('africangrooves/v1', '/post/', [
                'methods' => 'POST',
                'callback' => function (WP_REST_Request $req) {
                    $action = $req->get_json_params()['action'];
                    switch ($action) {
                        case 'fetch_content':
                            if ($url = $req->get_json_params()['url'])
                                return ag_fetch_content($url);
                            break;
                    }
                },
            ]);
        });
    }
}
