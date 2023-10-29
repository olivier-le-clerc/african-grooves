<nav id="navbar">
        <label for="menu-toggle" class="burger">&#9776;</label>
        <input type="checkbox" id="menu-toggle" />
        <?php wp_nav_menu([
            'theme_location' => 'ag_header_menu',
            'container' => 'ul',
        ]) ?>
        <?= get_search_form() ?>
</nav>