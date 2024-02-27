<?php // Time-stamp: <2023-02-07 22:03:44 olivier>
// TODO get_page_by_title deprecated
?>
<!doctype html>
<html lang="fr">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <!-- Google Tag Manager -->
    <script>
        (function(w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
            });
            var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s),
                dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src =
                'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', 'GTM-P777BRR4');
    </script>
    <!-- End Google Tag Manager -->

    <?php wp_head() ?>
</head>

<body id="front-page">

    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P777BRR4" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <ag-worldmap class="layer show-when-loaded"></ag-worldmap>

    <div id="map-ui" class="map-ui layer show-when-loaded">
        <?php get_template_part('parts/site-header') ?>

        <div id="controls" class="map-ui_body">
            <ag-blog-modal class="map-ui_main glass">
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