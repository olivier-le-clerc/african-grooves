<?php

define('POST_LIMIT', 10);

class AgApi
{
    static function init()
    {
        // custom api track field
        add_action('rest_api_init', function () {
            register_rest_field('song', 'featured-audio', [
                'get_callback' => function ($song_arr) {
                    $track = get_featured_audio($song_arr['id']);
                    return get_track_data($track);
                },
                'schema' => array(
                    'description' => 'description',
                    'type'        => 'integer'
                ),
            ]);
        });


        add_action('rest_api_init', function () {

            register_rest_route('africangrooves/v1', '/post/', [
                'methods' => 'POST',
                'callback' => function (WP_REST_Request $req) {
                    $action = $req->get_json_params()['action'];
                    $page = $req->get_json_params()['page'] ?? 1;
                    switch ($action) {

                        case 'fetch_content':
                            if ($url = $req->get_json_params()['url'])
                                return ag_fetch_content($url, $page);
                            break;

                        case 'region':
                            if ($region = $req->get_json_params()['region'])
                                return get_tracks($region, 'region');
                            break;

                        case 'last_tracks':
                            return get_tracks();
                            break;

                        case 'search':
                            if ($s = $req->get_json_params()['search'])
                                return get_tracks($s);
                            break;

                        case 'song_post':
                            if ($s = $req->get_json_params()['id'])
                                $res =  SongPostType::get_song($req->get_param('id'));
                            $res = replaceAudioPlayer($res);
                            return $res;
                            break;

                        case 'track':
                            if ($id = $req->get_json_params()['id']) {
                                $track = get_featured_audio($id);
                                return get_track_data($track);
                            }
                            break;
                    }
                },
            ]);
        });
    }
}


function ag_fetch_content($url, $page = 1)
{

    $res = '';
    // $args = ['post_type'=>'post'];
    if ($url) {
        $url = trim($url, '/');
        $url = explode('/', $url);
        if (sizeof($url) == 1) {
            $param = $url[0];
            if ($param == SongPostType::SLUG) {
                $args = [
                    'post_type' => SongPostType::SLUG
                ];
            } else { //page
                $args = [
                    "pagename" => $param,
                ];
            }
        } elseif (sizeof($url) == 2) {
            if ($url[0] == 'category') {
                $args['category_name'] = $url[1];
            } elseif ($url[0] == 'tag') {
                $args = [
                    'tag' => $url[1],
                    'post_type' => SongPostType::SLUG,
                ];
            } elseif ($url[0] == 'song') {
                $args = [
                    'post_type' => SongPostType::SLUG,
                    "name" => $url[1],
                ];
            } else {
                $args = [
                    'tax_query' => [[
                        'taxonomy' => $url[0],
                        'field' => 'slug',
                        'terms' => $url[1],
                    ]],
                    'post_type' => SongPostType::SLUG,
                ];
            }
        }

        $args['posts_per_page'] = POST_LIMIT;
        $args['paged'] = $page;

        $req = new WP_Query($args);

        if ($req->have_posts()) {
            while ($req->have_posts()) {
                $req->the_post();

                ob_start();
                get_template_part('parts/article');
                $out = ob_get_clean();

                //replace audio player if song
                if ($args['post_type'] == SongPostType::SLUG) {
                    $out = replaceAudioPlayer($out);
                }

                $res .= $out;
            }
        }
    }

    if (!$res) {
        ob_start();
        get_template_part('parts/no-result');
        $res = ob_get_clean();
    }

    return $res;
}
