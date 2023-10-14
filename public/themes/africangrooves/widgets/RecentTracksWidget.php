<?php
class RecentTracksWidget extends WP_Widget
{
    public function __construct()
    {
        parent::__construct('recent_tracks_widget', 'Recent Tracks Widget', []);
    }

    public function widget($args, $instance)
    {
        $number = $instance['number'] ?? '';
        $number = intval($number) ? $number :  5;
        echo $args['before_widget'];
        if (isset($instance['title'])) {
            $title = apply_filters('widget_title', $instance['title']);
            echo $args['before_title'] . $title . $args['after_title'];
        }
        $posts = get_posts([
            'numberposts' => $number,
            'post_type' => SongPostType::SLUG,
            'post_status' => 'publish',
            'orderby' => 'date',
            'order' => 'DESC'
        ]);
        // get mp3 ids
        $ids = array_map(fn(Wp_Post $post) => get_post_meta($post->ID,'featured-audio',true) ,$posts);
        echo wp_playlist_shortcode([
            'type' => 'audio',
            'ids' => $ids,
            'style' =>'light'
        ]);
        echo $args['after_widget'];
    }

    public function form($instance)
    {
        $title = $instance['title'] ?? '';
        $number = $instance['number'] ?? 5;
?>
        <p>
            <label for="<?= $this->get_field_id('title') ?>">Titre</label>
            <input class="widefat" type="text" name="<?= $this->get_field_name('title') ?>" id="<?= $this->get_field_name('title') ?>" value="<?= esc_attr($title) ?>">
        </p>
        <p>
            <label for="<?= $this->get_field_id('number') ?>">Nombre de morceaux</label>
            <input class="widefat" type="number" name="<?= $this->get_field_name('number') ?>" id="<?= $this->get_field_name('number') ?>" value="<?= esc_attr($number) ?>">
        </p>
<?php
    }

    public function update($new_instance, $old_instance)
    {
        return $new_instance;
    }
}
