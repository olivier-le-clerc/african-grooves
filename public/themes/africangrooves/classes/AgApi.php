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
            ]);
        });


        add_action('rest_api_init', function () {

            register_rest_route('africangrooves/v1', '/from-url', [
                'methods' => 'POST',
                'callback' => 'from_url_handler',
                'permission_callback' => fn () => true
            ]);

            register_rest_route('africangrooves/v1', '/music', [
                'methods' => 'POST',
                'callback' => 'music_handler',
                'permission_callback' => fn () => true
            ]);
        });
    }
}

function music_handler($request)
{
    $data = [
        'title' => '',
        'content' => []
    ];

    $url = $request["url"];

    $default_args = [
        'post_type' => SongPostType::SLUG,
        'post_status' => 'publish',
        'fields' => 'ids',
        'paged' => $request['page'],
    ];
    $args = array_merge($default_args, url_to_query_args($url) ?? [], $request['args'] ?? []);

    $data['title'] = $args['s'] ?? $args['tax_query'][0]['terms'] ?? 'Recent Tracks';
    $data['args'] = $args;

    $query = new WP_Query($args);



    $posts = $query->posts;


    foreach ($posts as $id) {

        $track = get_featured_audio($id);
        $data['content'][] = get_track_data($track);
    }
    send_headers($query);

    return $data;
}

function from_url_handler($request)
{
    $url = $request["url"];
    $args = array_merge(url_to_query_args($url) ?? [], $request['args'] ?? []);
    $query = new WP_Query($args);
    send_headers($query);

    //replace audio player if song
    // if ($args['post_type'] == SongPostType::SLUG) {
    //     $content = array_map('replaceAudioPlayer', $content);
    // }

    $content = get_content($query, $args['post_type'] == SongPostType::SLUG ? 'replaceAudioPlayer' : fn ($e) => $e);
    return $content;
}

function send_headers($query)
{
    $server = rest_get_server();
    $server->send_header('Content-Type', 'application/json; charset=' . get_option('blog_charset'));
    $server->send_header('X-Robots-Tag', 'noindex');
    $server->send_header('X-Content-Type-Options', 'nosniff');
    $server->send_header('W-WP-Total', $query->found_posts);
    $server->send_header('W-WP-TotalPages', $query->max_num_pages);
    $allow_headers = array(
        'Authorization',
        'X-WP-Nonce',
        'Content-Disposition',
        'Content-MD5',
        'Content-Type',
    );
    $server->send_header('Access-Control-Allow-Headers', implode(', ', $allow_headers));
}

function get_content($query, $callback = null)
{
    $res = [];

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();

            ob_start();
            get_template_part('parts/article');
            $out = ob_get_clean();
            $res[] = $callback ? $callback($out) : $out;
        }
    } else {
        ob_start();
        get_template_part('parts/no-result');
        $res[] = ob_get_clean();
    }
    wp_reset_postdata();
    return $res;
}

function url_to_query_args($url)
{
    // clean url
    $parsed = parse_url($url);
    parse_str($parsed['query'], $query_vars);
    $url = $parsed['path'];

    $url = str_replace([get_bloginfo('url'), 'index.php'], ['', ''], $url);

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
        return array_merge($args, $query_vars);
    }
}
