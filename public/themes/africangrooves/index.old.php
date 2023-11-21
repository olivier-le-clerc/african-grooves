<?php // Time-stamp: <2023-02-07 22:03:44 olivier>
?>
<!doctype html>
<html lang="fr">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head() ?>
</head>

<body>
    <?php get_template_part('parts/site-header') ?>
    <div class="row container">
        <main>
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

        </main>
        <?php if (get_post_type() !== 'page') : ?>
            <?php get_sidebar() ?>
        <?php endif ?>
    </div>
    <?php wp_footer() ?>
</body>

</html>