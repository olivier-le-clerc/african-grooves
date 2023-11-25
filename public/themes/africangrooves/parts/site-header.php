<header id="site-header" class="glass">

  <div id="header-top" class="container">

    <div id="burger-menu" class="icon-wrap mobile-only">
      <label for="navmenu-toggle">
        <i class="fa-solid fa-bars"></i>
        <!-- <i class="fa-solid fa-xmark"></i> -->
      </label>
    </div>

    <?php get_template_part('parts/social-media') ?>

    <div id="site-branding">
      <a href="<?= home_url() ?>">
        <h1 class="site-title"><?php bloginfo('name') ?><div class="h1-subtitle">Since 2010</div></h1>
      </a>
    </div>

    <div class="search right">
      <input id="search-drawer-toggle" type="checkbox">
      <div id="search-drawer">
        <?php get_search_form() ?>
        <div class="icon-wrap mobile-only">
          <label for="search-drawer-toggle">
            <i class="fa-solid fa-x"></i>
          </label>
        </div>
      </div>

      <div class="icon-wrap mobile-only">
        <label for="search-drawer-toggle">
          <i class="fa-solid fa-magnifying-glass"></i>
        </label>
      </div>
    </div>
  </div>



  <nav id="navbar">
    <input type="checkbox" id="navmenu-toggle" />
    <?php wp_nav_menu([
      'theme_location' => 'ag_header_menu',
      'container' => 'ul',
      'menu_class' => 'menu container',
    ]) ?>
  </nav>


</header>