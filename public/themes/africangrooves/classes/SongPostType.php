<?php
class SongPostType
{
    //TODO plusieurs labels

    const SLUG = 'song';

    public static function register()
    {

        register_post_type(self::SLUG, [
            'labels' => [
                'name' => 'African Grooves',
                'singular_name' => 'Morceau',
                'add_new_item' => 'Ajouter un nouveau morceau',
                'edit_item' => 'Editer un morceau',
                'new_item' => 'Nouveau morceau',
                'search items' => 'Rechercher dans les morceaux',
                'not_found' => 'Aucun résultat',
                'all_items' => 'Tous les morceaux',
                'archives' => 'Musical discoveries',
                'featured_image' => 'Image du disque',
            ],
            'public' => true,
            'menu_position' => 2,
            'menu_icon' => 'dashicons-format-audio',
            'supports' => ['editor', 'title','custom-fields'],
            'has_archive' => true,
            'taxonomies' => ['post_tag'],
            'show_in_rest' => true,
            'label' => self::SLUG
        ]);

        register_post_meta(SongPostType::SLUG,'featured-audio',[
            'type' => 'integer',
            'description' => 'id of featured audio attachement',
            'single' => true,
            'show_in_rest' => true
        ]);

        // column headers
        add_filter('manage_song_posts_columns', function ($columns) {
            return [
                'cb' => $columns['cb'],
                'thumbnail' => 'Image',
                'title' => $columns['title'],
                'main-artist' => 'Artiste',
                'taxonomy-disc_title' => $columns['taxonomy-disc_title'],
                'taxonomy-music_label' => $columns['taxonomy-music_label'],
                'year' => 'Année',
                'taxonomy-artist' => $columns['taxonomy-artist'],
                'taxonomy-music_style' => $columns['taxonomy-music_style'],
                'taxonomy-region' => $columns['taxonomy-region'],
                'date' => $columns['date'],
            ];
            $columns['thumbnail'] = 'Pochette du Disque';
            return $columns;
        });

        add_filter('default_content', function (string $post_content, WP_Post $post) {
            return $post->post_type == SongPostType::SLUG ? get_option('post_footer', '') : '';
        }, 10, 2);

        // custom columns content
        add_filter('manage_song_posts_custom_column', function ($column, $postId) {
            switch ($column) {
                case "main-artist":
                    echo get_post_meta($postId, 'ag_music_band', true);
                    break;
                case "thumbnail":
                    the_post_thumbnail('thumbnail', $postId);
                    break;
                case 'year':
                    echo get_post_meta($postId, 'ag_year', true);
                    break;
                default:
                    break;
            }
        }, 10, 2);

        // custom search
        add_filter('pre_get_posts', function (WP_Query $query) {
            if ($query->is_search && !is_admin()) {
                $query->set("posts_per_page", get_option('posts_per_page'));
                $query->set("post_type", SongPostType::SLUG);
                $query->set("orderby", 'date');
                $query->set("nopaging", false);
            }
            return $query;
        });

        // save post hook
        add_action('save_post', [self::class, 'save'], 10, 3);

        // don't want to include featured audio on head of the post
        remove_filter('the_content', 'featured_audio_template_filter');
    }

    public static function save(int $post_id, WP_Post $post, bool $update)
    {
        if ($post->post_type !== SongPostType::SLUG) {
            return;
        }

        // auto register parent regions
        if ($terms = get_the_terms($post, 'region')) {
            $regions = array_map(fn (Wp_Term $term) => $term->term_id, $terms);
            $added = [];
            foreach ($regions as $region) {
                $parents = get_ancestors($region, 'region');
                foreach ($parents as $parent) {
                    if (!in_array($parent, $added) && !in_array($parent, $regions))
                        $added[] = $parent;
                }
            }
            $res = wp_set_post_terms($post_id, array_merge($regions, $added), 'region');
        }
        $content = $post->post_content;
        if (!empty($content)) {

            // get first mp3 attachment
            $mp3_id = self::get_first_audio_id($post);

            // get first image attachment
            $image_id = self::get_first_image_id($post);

            // get post info from taxonomies
            $params = [
                'artist' => get_the_terms($post, ArtistTaxonomy::SLUG),
                'album' => get_the_terms($post, DiscTaxonomy::SLUG),
                'label' => get_the_terms($post, MusicLabelTaxonomy::SLUG),
            ];
            foreach ($params as $key => $value) {
                $params[$key] = is_array($value) ? reset($value)->name : '';
            }

            if ($mp3_id) {

                update_post_meta($post_id, 'featured-audio', $mp3_id);

                // current post becomes attachment's parent
                wp_update_post([
                    'ID' => $mp3_id,
                    'post_parent' => $post_id,
                    'post_title' => $post->post_title,
                    'post_date' => $post->post_date,
                ]);

                // updates attachment meta
                wp_update_attachment_metadata($mp3_id, [
                    'title' => $post->post_title,
                    'artist' => get_post_meta($post_id,AgMetaBox::META_KEYS['music_band'],true),
                    'album' => $params['album'],
                    'year' => get_post_meta($post_id, AgMetaBox::META_KEYS['year'], true),
                    'label' => $params['label'],
                ]);

                //creates mp3 thumbnail
                if ($image_id) {
                    set_post_thumbnail($mp3_id, $image_id);
                } else {
                    delete_post_thumbnail($mp3_id);
                }
            } else {
                delete_post_meta($post_id, 'featured-audio');
            }
            // creates post thumbnail from first image
            if ($image_id) {
                // current post becomes attachment's parent
                wp_update_post([
                    'ID' => $image_id,
                    'post_title' => $params['album'] . ' disc cover',
                    'post_parent' => $post_id,
                    'post_date' => $post->post_date,
                ]);
                // sets post thumbnail
                set_post_thumbnail($post, $image_id);
            } else {
                delete_post_thumbnail($post_id);
            }
        }
        generate_dynamic_map_data();
    }
    /**
     * Returns ID of first audio content in the file.
     *
     * @param WP_Post $post the post to look into
     * @return int|false attachment id if found, false otherwise.
     */
    public static function get_first_audio_id(WP_Post $post): int|false
    {
        $mp3_array = get_attached_media('audio', $post);
        if (empty($mp3_array)) {
            if (preg_match('/<audio.*src="(.*)"/U', $post->post_content, $out)) {
                $mp3_id = attachment_url_to_postid($out[1]);
            } else if (preg_match('/\[audio mp3="(.*)"\]/U', $post->post_content, $out)) {
                $mp3_id = attachment_url_to_postid($out[1]);
            } else {
                $mp3_id = false;
            }
        } else {
            $mp3_id = reset($mp3_array)->ID; // get first mp3 media;
        }
        return $mp3_id;
    }

    /**
     * Returns ID of first image content in the file.
     *
     * @param WP_Post $post the post to look into
     * @return int|false attachment id if found, false otherwise.
     */
    public static function get_first_image_id(WP_Post $post): int|false
    {
        $image_array = get_attached_media('image', $post);

        if (empty($image_array)) {
            if (preg_match('%<img.*src="(.*)"%U', $post->post_content, $out)) {
                $image_id = attachment_url_to_postid($out[1]);

                if ($image_id == 0) {
                    $out[1] = preg_replace('/-[0-9]+x[0-9]+(\.[a-zA-Z]+)$/', '\1', $out[1]);
                    $image_id = attachment_url_to_postid($out[1]);
                }
            } else {
                $image_id = 0;
            }
        } else {
            $image_id = reset($image_array)->ID;
        }
        return $image_id;
    }

    public static function get_song($id)
    {
        $res = [];
        $res['link'] = get_permalink($id);
        global $post;
        $post = get_post($id);
        setup_postdata($post);

        ob_start();
        get_template_part('parts/article');
        $res['content'] = ob_get_clean();

        wp_reset_postdata();

        return $res;
    }

    public static function removeAudioPlayer($content){

    }
}
