<form id="navbar-search" action="<?php echo esc_url( home_url( '/' ) ); ?>">
    <input class="form-control me-2" name="s" type="search" placeholder="Afro, Arabic, Funk ..." aria-label="Search" value="<?= get_search_query() ?>">
    <button class="icon-wrap" type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
</form>