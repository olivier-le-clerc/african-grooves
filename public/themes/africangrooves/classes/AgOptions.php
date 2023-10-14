<?php
class AgOptions
{
    const GROUP = 'ag_options';

    public static function register()
    {
        add_action('admin_menu', [self::class, 'addMenu']);
        add_action('admin_init', [self::class, 'registerSettings']);
    }

    public static function addMenu()
    {
        if (class_exists('SongPostType')) {
            add_submenu_page('edit.php?post_type=' . SongPostType::SLUG, 'Options', 'Options', 'manage_options', self::GROUP, [self::class, 'render']);
        }
    }

    public static function registerSettings()
    {
        register_setting(self::GROUP, 'post_footer');

        register_setting(self::GROUP, 'instagram_link');
        register_setting(self::GROUP, 'facebook_link');
        register_setting(self::GROUP, 'tiktok_link');
        register_setting(self::GROUP, 'youtube_link');

        add_settings_section('ag_settings', 'Paramètres', function () {
            echo 'Ici, vous pouvez gérer les paramètres liés aux morceaux enregistrés.';
        }, self::GROUP);
        add_settings_field('social_media', 'Réseaux sociaux','AgOptions::render_social_media', self::GROUP, 'ag_settings');
        add_settings_field('ag_settings_footer', 'Pied de page', fn()=>wp_editor(get_option('post_footer'), "post_footer"), self::GROUP, 'ag_settings');
    }

    public static function render()
    {
        ?>
        <h2>Options</h2>
        <form action="options.php" method="post">
            <?php settings_fields(self::GROUP);
            do_settings_sections(self::GROUP);
            submit_button() ?>
        </form>
<?php
    }

    public static function render_social_media(){
        ?>
        
        <table class="form-table" role="presentation">
            <tbody>
                <tr>
                    <th scope="row">
                        <label for="instagram_link">Instagram : </label>
                    </th>
                    <td>
                        <input type="text" id='instagram_link' class='regular-text code' name='instagram_link' value="<?= get_option('instagram_link') ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="tiktok_link">Tiktok : </label>
                    </th>
                    <td>
                        <input type="text" id='tiktok_link' name='tiktok_link' class='regular-text code' value="<?= get_option('tiktok_link') ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="youtube_link">Youtube : </label>
                    </th>
                    <td>
                        <input type="text" id='youtube_link' name='youtube_link' class='regular-text code' value="<?= get_option('youtube_link') ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="facebook_link">Facebook : </label>
                    </th>
                    <td>
                        <input type="text" id='facebook_link' name='facebook_link' class='regular-text code' value="<?= get_option('facebook_link') ?>">
                    </td>
                </tr>
            </tbody>
        </table>
    <?php
    }
}
