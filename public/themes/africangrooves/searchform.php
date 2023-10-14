<form id="navbar-search" action="<?php echo esc_url( home_url( '/' ) ); ?>">
    <input class="form-control me-2" name="s" type="search" placeholder="Search" aria-label="Search" value="<?= get_search_query() ?>">
    <button class="btn btn-outline-light" type="submit">Search</button>
</form>