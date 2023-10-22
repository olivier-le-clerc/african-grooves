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

    <div id="map-ui" class="layer show-when-loaded">
        <?php get_template_part('parts/site-header') ?>

        <div id="controls">
            <ag-audio-player></ag-audio-player>

            <div id="post-modal" class="modal-container">
                <div class="modal-background" onclick="closeModal()"></div>
                <div class="modal-loader">
                    <div class="img-wrap">
                        <img src="<?= get_stylesheet_directory_uri() . '/assets/img/vinyl.svg' ?>" alt="">
                    </div>
                </div>
                <div class="modal-card">
                    <button id="post-close-button" class="icon-wrap modal-close" onclick="closeButton()"><i class="fa-solid fa-x"></i></button>
                    <div id="article-body" class="article-body">
                    </div>
                </div>
            </div>

        </div>
    </div>

    <div id="loader" class="layer">
        <h1><?php bloginfo('name') ?></h1>
        <h2><?php bloginfo('description') ?></h2>
        <img src="<?= get_stylesheet_directory_uri() . '/assets/img/vinyl.svg' ?>" alt="">
    </div>

    <?php get_footer() ?>