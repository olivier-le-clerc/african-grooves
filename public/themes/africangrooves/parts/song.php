<article class="song-post">
    <header>
        <h2><?php the_song_title() ?></h2>
        <h3><?php the_song_subtitle() ?></h3>
        <p><?php the_date('d / m / Y', 'posted on ', '') ?></p>
    </header>
    <div class="article-content">
        <?php the_content() ?>
    </div>
    <footer>
        <div class="term-list">
            <?php the_ag_terms(get_the_ID()) ?>
        </div>
    </footer>
</article>