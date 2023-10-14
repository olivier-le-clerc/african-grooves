<header id="site-header">

<div id="header-top" class="container">

  <div id="burger-menu" class="icon-wrap mobile-only">
    <label for="navmenu-toggle">
      <i class="fa-solid fa-bars"></i>
      <!-- <i class="fa-solid fa-xmark"></i> -->
    </label>
  </div>

  <ul class="icon-group left desktop-only">
    <li class="icon-wrap"><a href="<?= get_option('tiktok_link') ?>"><i class="fa-brands fa-tiktok"></i></a></li>
    <li class="icon-wrap"><a href="<?= get_option('instagram_link') ?>"><i class="fa-brands fa-instagram"></i></a></li>
    <li class="icon-wrap"><a href="<?= get_option('youtube_link') ?>"><i class="fa-brands fa-youtube"></i></a></li>
    <li class="icon-wrap"><a href="<?= get_option('facebook_link') ?>"><i class="fa-brands fa-facebook"></i></a></li>
  </ul>

  <div id="site-branding">
    <a href="<?= home_url() ?>">
      <h1 class="site-title"><?php bloginfo('name') ?></h1>
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