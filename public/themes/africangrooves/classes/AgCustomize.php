<?php
class AgCustomize
{
    public static function setup()
    {
        add_action('customize_preview_init', function () {
            wp_enqueue_script('ag_customize', get_template_directory_uri() . '/assets/js/customize-preview.js', ['jquery', 'customize-preview'], '', true);
        });

        add_action('customize_register', function (WP_Customize_Manager $manager) {
            $manager->add_section('ag_customize', [
                'title' => 'Couleurs et papier-peint',
            ]);
        
            // background-color
            $manager->add_setting('background-color', [
                'default' => '#d7d7d7',
                'transport' => 'postMessage',
                'sanitize_callback' =>  'sanitize_hex_color',
            ]);
            $manager->add_control(new WP_Customize_Color_Control($manager, 'background-color', [
                'section' => 'ag_customize',
                'label' => 'Couleur de l\'arrière-plan',
            ]));
        
            // primary-color
            $manager->add_setting('primary-color', [
                'default' => '#303030',
                'transport' => 'postMessage',
                'sanitize_callback' =>  'sanitize_hex_color',
            ]);
            $manager->add_control(new WP_Customize_Color_Control($manager, 'primary-color', [
                'section' => 'ag_customize',
                'label' => 'Couleur principale',
            ]));
        
            // secondary-color
            $manager->add_setting('secondary-color', [
                'default' => '#d7d7d7',
                'transport' => 'postMessage',
                'sanitize_callback' =>  'sanitize_hex_color',
            ]);
            $manager->add_control(new WP_Customize_Color_Control($manager, 'secondary-color', [
                'section' => 'ag_customize',
                'label' => 'Couleur secondaire',
            ]));
        
            // title-color
            $manager->add_setting('link-color', [
                'default' => '#c9d130',
                'transport' => 'postMessage',
                'sanitize_callback' =>  'sanitize_hex_color',
            ]);
            $manager->add_control(new WP_Customize_Color_Control($manager, 'link-color', [
                'section' => 'ag_customize',
                'label' => 'Couleur des liens',
            ]));
        
            // text-color
            $manager->add_setting('text-color', [
                'default' => '#303030',
                'transport' => 'postMessage',
                'sanitize_callback' =>  'sanitize_hex_color',
            ]);
            $manager->add_control(new WP_Customize_Color_Control($manager, 'text-color', [
                'section' => 'ag_customize',
                'label' => 'Couleur du texte',
            ]));

            // background image
            $manager->add_setting('background-image', [
                'default' => '',
                'transport' => 'postMessage',
            ]);
            $manager->add_control(new WP_Customize_Image_Control($manager, 'background-image', [
                'label' => 'Image d\'arrière-plan',
                'section' => 'ag_customize',
                'settings' => 'background-image',
            ]));
        });
    }
    public static function getCustomCss(){
        $styles = '';
        // custom colors
        foreach (['background', 'primary', 'secondary', 'link', 'text'] as $current) {
            if ($color = get_theme_mod($current . '-color')) {
                $styles .= '--' . $current . '-color:' . $color . ';';
            }
        }
        // background image
        if ($image = get_theme_mod('background-image')) {
            $styles .= '--background-image:url(' . $image . ');';
        }
        return ':root{' . $styles . '}';
    }
}
