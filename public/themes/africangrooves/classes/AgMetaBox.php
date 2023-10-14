<?php
class AgMetaBox
{

    const META_KEYS = [
        'year' => 'ag_year',
        'main_country' => 'main_country',
        'music_band' => 'ag_music_band'
    ];

    const POST_TYPES = [SongPostType::SLUG];

    public static function register()
    {
        add_action('add_meta_boxes', [self::class, 'add'], 10, 2);
        add_action('save_post', [self::class, 'save'], 9);
    }

    public static function add()
    {
        add_meta_box(self::class, 'Métadonnées', [self::class, 'render'], self::POST_TYPES, 'normal');
    }

    public static function render($post)
    {
?>
        <p>
            <label for="<?= self::META_KEYS['main_country'] ?>">Pays principal ( figurant dans le titre du morceau ) :</label><br>
            <input type="text" class="large-text" name="<?= self::META_KEYS['main_country'] ?>" value="<?= get_post_meta($post->ID, self::META_KEYS['main_country'], true) ?>">
        </p>
        <p>
            <label for="<?= self::META_KEYS['music_band'] ?>">Groupe musical ( figurant dans le titre du morceau ) :</label>
            <input type="text" class="large-text" name="<?= self::META_KEYS['music_band'] ?>" value="<?= get_post_meta($post->ID, self::META_KEYS['music_band'], true) ?>">
        </p>
        <p>
            <label for="<?= self::META_KEYS['year'] ?>">Année de publication :</label>
            <input type="text" class="large-text" name="<?= self::META_KEYS['year'] ?>" value="<?= get_post_meta($post->ID, self::META_KEYS['year'], true) ?>">
        </p>



<?php
    }

    public static function save($post_id)
    {
        if (current_user_can('edit_post', $post_id)) {
            if (array_key_exists(self::META_KEYS['year'], $_POST)) {
                $value = sanitize_key($_POST[self::META_KEYS['year']]);
                if (empty($value)) {
                    delete_post_meta($post_id, self::META_KEYS['year']);
                } else {
                    if (preg_match('/^[0-9]{3}[0-9?x]s?$/i', $value)) {
                        $value = str_replace('x',"0's",$value);
                        update_post_meta($post_id, self::META_KEYS['year'], $value);
                    } else {
                        //erreur
                    }
                }
            }

            if (array_key_exists(self::META_KEYS['main_country'], $_POST)) {
                $value = sanitize_text_field($_POST[self::META_KEYS['main_country']]);
                if (empty($value)) {
                    delete_post_meta($post_id, self::META_KEYS['main_country']);
                } else {
                    update_post_meta($post_id, self::META_KEYS['main_country'], $value);
                }
            }

            if (array_key_exists(self::META_KEYS['music_band'], $_POST)) {
                $value = sanitize_text_field($_POST[self::META_KEYS['music_band']]);
                if (empty($value)) {
                    delete_post_meta($post_id, self::META_KEYS['music_band']);
                } else {
                    update_post_meta($post_id, self::META_KEYS['music_band'], $value);
                }
            }
        }
    }
}
