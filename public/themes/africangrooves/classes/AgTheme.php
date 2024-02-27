<?php
class AgTheme
{

    public static function setup()
    {
        // activation hook
        add_action('after_switch_theme', function () {
            // taxonomies
            AgTaxonomy::import_from_csv('taxonomy_import.csv');
            AgAlias::import_from_csv('aliases.csv');
            // image sizes
            image_sizes_update([
                'thumbnail_size_h' => 100,
                'thumbnail_size_w' => 100,
                'medium_size_h' => 650,
                'medium_size_w' => 650,
            ]);
            flush_rewrite_rules();
        });

        // deactivation_hook
        add_action('switch_theme', function () {
            image_sizes_restore();
            flush_rewrite_rules();
        });

        // custom API endpoints
        AgApi::init();

        add_action('init', function () {
            SongPostType::register();
            AgTaxonomy::RegisterAll();
            AgMetaBox::register();
            AgAlias::register(['region', 'music_style', 'artist']);
            AgAlias::setup();
            AgOptions::register();
            if (!file_exists(get_template_directory() . '/cache/dynamic_map_data.json')) {
                generate_dynamic_map_data();
            }
        });

        // init
        add_action('after_setup_theme', function () {
            add_theme_support('title-tag');
            add_theme_support('menus');
            register_nav_menu('ag_header_menu', 'Menu de l\'en-tête');
            remove_theme_support('widgets-block-editor');
        });

        //disable block editor
        add_filter('use_block_editor_for_post', '__return_false');

        // Wordplate

        // Register scripts and styles.
        add_action('wp_enqueue_scripts', function () {
            $manifestPath = get_theme_file_path('assets/manifest.json');

            if (
                wp_get_environment_type() === 'local' &&
                is_array(wp_remote_get('http://localhost:5173/')) // is Vite.js running
            ) {
                wp_enqueue_script('vite', 'http://localhost:5173/@vite/client', [], null);
                wp_enqueue_script('wordplate', 'http://localhost:5173/resources/js/index.js', [], null);
            } elseif (file_exists($manifestPath)) {
                $manifest = json_decode(file_get_contents($manifestPath), true);
                wp_enqueue_script('wordplate', get_theme_file_uri('assets/' . $manifest['resources/js/index.js']['file']), [], null);
                wp_enqueue_style('wordplate', get_theme_file_uri('assets/' . $manifest['resources/js/index.css']['file']), [], null);
            }

            // customize
            // wp_add_inline_style('ag-style', AgCustomize::getCustomCss());

            wp_localize_script('wordplate', 'frontend', [
                'homeUrl' => home_url()
            ]);
        });

        // Load scripts as modules.
        add_filter('script_loader_tag', function (string $tag, string $handle, string $src) {
            if (in_array($handle, ['vite', 'wordplate'])) {
                return '<script defer type="module" src="' . esc_url($src) . '" ></script>';
            }

            return $tag;
        }, 10, 3);

        if (is_admin()) {

            // Remove admin menu items.
            add_action('admin_init', function () {
                remove_menu_page('edit-comments.php'); // Comments
                // remove_menu_page('edit.php?post_type=page'); // Pages
                // remove_menu_page('edit.php'); // Posts
                remove_menu_page('index.php'); // Dashboard
                // remove_menu_page('upload.php'); // Media

            });

            add_action('admin_menu', function () {
                remove_submenu_page('themes.php', 'widgets.php');
            });

            // Remove admin toolbar menu items.
            add_action('admin_bar_menu', function (WP_Admin_Bar $menu) {
                $menu->remove_node('comments'); // Comments
                $menu->remove_node('customize'); // Customize
                $menu->remove_node('dashboard'); // Dashboard
                $menu->remove_node('edit'); // Edit
                $menu->remove_node('menus'); // Menus
                $menu->remove_node('new-content'); // New Content
                $menu->remove_node('search'); // Search
                // $menu->remove_node('site-name'); // Site Name
                $menu->remove_node('themes'); // Themes
                $menu->remove_node('updates'); // Updates
                $menu->remove_node('view-site'); // Visit Site
                $menu->remove_node('view'); // View
                $menu->remove_node('widgets'); // Widgets
                $menu->remove_node('wp-logo'); // WordPress Logo
            }, 999);

            // Remove admin dashboard widgets.
            add_action('wp_dashboard_setup', function () {
                remove_meta_box('dashboard_activity', 'dashboard', 'normal'); // Activity
                // remove_meta_box('dashboard_right_now', 'dashboard', 'normal'); // At a Glance
                remove_meta_box('dashboard_site_health', 'dashboard', 'normal'); // Site Health Status
                remove_meta_box('dashboard_primary', 'dashboard', 'side'); // WordPress Events and News
                remove_meta_box('dashboard_quick_press', 'dashboard', 'side'); // Quick Draft
            });
        }


        // Add custom login form logo.
        add_action('login_head', function () {
            $url = get_theme_file_uri('favicon.svg');

            $styles = [
                sprintf('background-image: url(%s)', $url),
                'width: 200px',
                'background-position: center',
                'background-size: contain',
            ];

            printf(
                '<style> .login h1 a { %s } </style>',
                implode(';', $styles)
            );
        });

        // adds dropdown extra html to menus with submenus
        add_filter('walker_nav_menu_start_el', function ($output, $item) {
            $classes = $item->classes;
            if (!empty($classes) && in_array('menu-item-has-children', $classes)) {
                $html = '
                <label title="Toggle Drop-down" class="drop-icon" for="sm' . $item->ID . '"></label></a>
                <input type="checkbox" id="sm' . $item->ID . '">';
                $output = str_replace('</a>', $html . '</a>', $output);
            }
            return $output;
        }, 30, 2);

        // if (is_customize_preview()) {
        //     AgCustomize::setup();
        // }
    }
}
