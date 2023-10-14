<aside id="main-sidebar">
    <?php if (!dynamic_sidebar('sidebar')) :
        // affichage par défaut si aucun widget installé 
    ?>
        <li id="recent-posts-2" class="widget widget_recent_entries">
            <h2 class="widgettitle">Articles récents</h2>
            <ul>
                <?php wp_get_archives(['type' => 'monthly']) ?>
            </ul>
        </li>
    <?php endif ?>
</aside>