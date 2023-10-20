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

    <div id="worldmap" class="layer show-when-loaded">
        <?php get_template_part('parts/world-map') ?>
    </div>

    <div id="map-ui" class="layer show-when-loaded">
        <?php get_template_part('parts/site-header') ?>
        <div id="controls">

            <ag-audio-player>

            </ag-audio-player>

            <template id="track-template">
                <div class="track" data-src="" data-id="">
                    <img class="track-thumb">
                    <div class="track-infos">
                        <h3 id="track-title" class="track-text track-title"></h3>
                        <h4 id="track-artist" class="track-text track-artist"></h4>
                        <div class='controls'>
                            <button id="play" class="player-button button-play" onclick="playPause()"><i class="fa-solid fa-play"></i></button>
                            <button id="next" class="player-button button-next" onclick="next()"><i class="fa-solid fa-forward-fast"></i></button>
                            <button id="plus" class="player-button button-plus" onclick="postModal()"><i class="fa-solid fa-circle-info"></i></button>
                        </div>
                    </div>
            </div>
            </template>

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