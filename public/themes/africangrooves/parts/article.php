<?php if (get_post_type() == SongPostType::SLUG) : ?>
    <article class="song-post">
<?php else : ?>
    <article>
<?php endif ?>
        <header>
        <?php if (get_post_type() == SongPostType::SLUG) : ?>
            <h2><?php the_song_title() ?></h2>
            <h3><?php the_song_subtitle() ?></h3>
            <em><?php the_date('d / m / Y', 'posted on ', '') ?></em>
        <?php else : ?>
            <h2><?php the_title() ?></h2>
        <?php endif ?>
        </header>
        <div class="article-content">
            <?php the_content() ?>
        </div>
        <footer>
            <div class="term-list">
                <?php the_ag_terms() ?>
            </div>
        </footer>
    </article>