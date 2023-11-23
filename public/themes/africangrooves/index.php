<?php // Time-stamp: <2023-02-07 22:03:44 olivier>
// TODO get_page_by_title deprecated
?>
<!doctype html>
<html lang="fr">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <?php wp_head() ?>
</head>

<body id="front-page">

    <ag-worldmap class="layer show-when-loaded"></ag-worldmap>

    <div id="map-ui" class="map-ui layer show-when-loaded">
        <?php get_template_part('parts/site-header') ?>

        <div id="controls" class="map-ui_body">
            <ag-blog-modal class="map-ui_main glass <?php if (have_posts() && !is_front_page()) echo "is-visible" ?>">
                <?php if (have_posts()) : ?>
                    <?php while (have_posts()) {
                        the_post();
                        get_template_part('parts/article');
                    } ?>
                <?php else : ?>
                    Aucun article trouvé
                <?php endif ?>

                <?php if (is_archive() || is_search()) : ?>
                    <!-- pagination -->
                    <?php the_posts_pagination() ?>
                <?php endif ?>

            </ag-blog-modal>
            <ag-audio-player class="map-ui_aside glass"></ag-audio-player>
        </div>

        <ag-modal></ag-modal>
    </div>

    <div id="loader" class="layer">
        <h1><?php bloginfo('name') ?></h1>
        <h2><?php bloginfo('description') ?></h2>
        <img src="<?= get_stylesheet_directory_uri() . '/assets/img/vinyl.svg' ?>" alt="">
    </div>
    <?php wp_footer() ?>
</body>

</html>