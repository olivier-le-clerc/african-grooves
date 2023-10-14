<?php
class AgAlias
{
    static $supports = ['post_tag', 'category'];

    public static function register(array|string $taxonomies)
    {
        if (!is_array($taxonomies)) $taxonomies = [$taxonomies];
        foreach ($taxonomies as $taxonomy) {
            if (taxonomy_exists($taxonomy)) self::$supports[] = $taxonomy;
        }
    }

    public static function deregister(array|string $taxonomies)
    {
        if (!is_array($taxonomies)) $taxonomies = [$taxonomies];
        foreach ($taxonomies as $taxonomy) {
            self::$supports = array_diff(self::$supports, [$taxonomy]);
        }
    }

    public static function setup()
    {
        // replace alias by ref when searching
        add_filter('pre_get_posts', function (WP_Query $query) {
            if ($query->is_search && !is_admin()) {
                $ref = AgAlias::getRef($query->query['s']);
                if ($ref) {
                    $query->query['s'] = $ref;
                    $query->query_vars['s'] = $ref;
                }
            }
            return $query;
        });
        foreach (self::$supports as $taxonomy) {
            add_action('saved_' . $taxonomy, [self::class, 'save']);
            add_action($taxonomy . '_add_form_fields', [self::class, 'renderNew']);
            add_action($taxonomy . '_edit_form_fields', [self::class, 'renderEdit'], 10, 2);
            add_filter('manage_edit-' . $taxonomy . '_columns', function ($columns) {
                // insert at 3rd position
                $beg = array_slice($columns, 0, 2);
                $middle = ['alias' => 'Alias(es)'];
                $end = array_slice($columns, 2);
                $columns = array_merge($beg, $middle, $end);
                return $columns;
            });
            add_action('manage_' . $taxonomy . '_custom_column', function ($string, $column, $term_id) {
                switch ($column) {
                    case 'alias':
                        $alias_array = get_term_meta($term_id, 'alias', false);
                        $out = empty($alias_array) ? '-' : implode(', ', $alias_array);
                        echo $out;
                        break;
                }
            }, 10, 3);
        }
    }

    public static function import_from_csv($file)
    {
        $file = fopen(AGTHEME_DIR . '/' . $file, 'r');
        fgetcsv($file, null, ','); //skip headers
        while ($line = fgetcsv($file, null, ',')) {
            $taxonomy = $line[0];
            $alias = sanitize_title($line[1]);
            $ref = sanitize_title($line[2]);
            $term = get_term_by('slug', $ref, $taxonomy) ? get_term_by('slug', $ref, $taxonomy)->term_id : 0;

            if($term && !in_array($alias,get_term_meta($term,'alias',false))){
                self::add($term,$alias);
            }
        }
    }

    /**
     * creates an alias for the given term
     * @param int|WP_Term $term the reference term
     * @param string $alias the alias string
     */

    public static function add(int|WP_Term $term, string $alias)
    {
        $alias = sanitize_title($alias);
        $term_id = $term instanceof WP_Term ? $term->term_id : intval($term);

        $aliases = get_term_meta($term_id, 'alias', false);
        if (is_array($aliases) && !in_array($alias, $aliases)) {
            $res = add_term_meta($term_id, 'alias', $alias);
        } else {
            $res = false;
        }
        return $res;
    }

    public static function renderNew()
    {
?>
        <div class="form-field term-alias-wrap">
            <label for="alias">Alias</label>
            <input name="alias" id="alias" type="text" value="" size="40" aria-describedby="aliases-list" />
            <p id="alias-description">Saisir une liste d'alias séparés par des virgules.</p>
        </div>
    <?php
    }

    public static function renderEdit(WP_Term $term = null)
    {
        $alias_list = '';
        if ($term && $aliases = get_term_meta($term->term_id, 'alias', false)) {
            $alias_list = implode(', ', $aliases);
        }
    ?>
        <tr class="form-wrap form-field term-aliases-wrap">
            <th scope="row"><label for="alias">Aliases</label></th>
            <td><input name="alias" id="alias" type="text" value="<?= $alias_list ?>" size="40" aria-describedby="aliases-list" />
                <p class="description" id="alias-description">Saisir une liste d'alias séparés par des virgules.</p>
            </td>
        </tr>
<?php
    }

    /**
     * checks if search matches a term or alias, returns matching term name or false
     * @param string $in the term to search
     * @param $taxonomy the taxonomy
     * @return string|false The term name or false when non-existent.
     */

    public static function getRef(string $in, string $taxonomy = '')
    {
        $search = sanitize_title($in);
        if ($match = get_term_by('slug', $search, $taxonomy)) {
            return $match->name;
        }
        global $wpdb;
        $prefix = $wpdb->prefix;
        if ($taxonomy) {
            $query = "
            SELECT name FROM " . $prefix . "terms 
            NATURAL JOIN " . $prefix . "termmeta 
            NATURAL JOIN " . $prefix . "term_taxonomy 
            WHERE meta_key = 'alias' 
            AND meta_value = '$search' 
            AND taxonomy='$taxonomy'";
        } else {
            $query = "
            SELECT name FROM " . $prefix . "terms 
            NATURAL JOIN " . $prefix . "termmeta 
            WHERE meta_key = 'alias' 
            AND meta_value = '$search'";
        }
        $res = $wpdb->get_var($query);
        return  $res ?? false;
    }

    public static function save($term_id)
    {
        if (isset($_POST['alias'])) {
            $aliases = explode(',', sanitize_text_field($_POST['alias']));
            delete_term_meta($term_id, 'alias');
            if (!empty($aliases)) {
                foreach ($aliases as $alias) {
                    AgAlias::add($term_id, trim($alias));
                }
            }
        }
    }
}
