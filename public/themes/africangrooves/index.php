<?php // Time-stamp: <2023-02-07 22:03:44 olivier>

get_header() ?>
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
<?php get_footer() ?>