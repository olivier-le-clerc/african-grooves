<?php

abstract class AgTaxonomy
{
    const SLUG = '';

    public static function RegisterAll()
    {
        RegionTaxonomy::register();
        DiscTaxonomy::register();
        MusicalGenreTaxonomy::register();
        MusicLabelTaxonomy::register();
        ArtistTaxonomy::register();
    }

    public static function deleteAll()
    {
        RegionTaxonomy::deleteTerms();
        DiscTaxonomy::deleteTerms();
        MusicalGenreTaxonomy::deleteTerms();
        MusicLabelTaxonomy::deleteTerms();
        ArtistTaxonomy::deleteTerms();
    }

    public static function import_from_csv($file)
    {
        $file = fopen(AGTHEME_DIR . '/' . $file, 'r');
        fgetcsv($file, null, ';'); //skip headers
        while ($line = fgetcsv($file, null, ',')) {
            $taxonomy = $line[0];
            $term = $line[1];

            $parent = get_term_by('slug', $line[2], $taxonomy) ? get_term_by('slug', $line[2], $taxonomy)->term_id : 0;
            if(!term_exists($term,$taxonomy,['parent' => $parent])){
                wp_insert_term($term, $taxonomy, ['parent' => $parent]);
            }
        }
    }

    public static function deleteTerms()
    {

        $terms = get_terms([
            'taxonomy' => static::SLUG,
            'fields' => 'ids',
            'hide_empty' => false,
        ]);
        foreach ($terms as $term) {
            wp_delete_term($term, static::SLUG);
        }
    }

    public abstract static function register();

    public static function insertTerm(string $term, array $args = []): array|\WP_Error
    {
        return wp_insert_term($term, self::SLUG, $args);
    }

    public static function deleteTerm(int|string $term)
    {
        if (!is_int($term)) {
            $term = get_term_by('slug', $term, self::SLUG)->term_id ?: get_term_by('name', $term, self::SLUG)->term_id;
        }
        wp_delete_term($term, self::SLUG);
    }
}

class DiscTaxonomy extends AgTaxonomy
{

    const SLUG = 'disc_title';
    public static function register()
    {
        register_taxonomy(self::SLUG, ['song', 'attachement'], [
            'labels' => [
                'name' => 'Disque',
                'singular_name' => 'Disque',
                'all_items' => 'Tous les disques',
                'edit_item' => 'Editer le disque',
                'view_item' => 'Voir le disque',
                'update_item' => 'Modifier le disque',
                'add_new_item' => 'Ajouter un disque',
                'new_item_name' => 'Nouveau nom de disque',
                'search_items' => 'Rechercher un disque',
                'popular_items' => 'Disques populaires',
                'no_found' => 'Aucun résultat trouvé.'
            ],
            'public' => true,
            'show_in_rest' => true,
            'show_admin_column' => true,
        ]);
    }
}

class MusicalGenreTaxonomy extends AgTaxonomy
{

    const SLUG = 'music_style';

    public static function register()
    {
        register_taxonomy(self::SLUG, ['song', 'attachement', 'post'], [
            'labels' => [
                'name' => 'Styles',
                'singular_name' => 'Style',
                'all_items' => 'Tous les styles',
                'edit_item' => 'Editer le style',
                'view_item' => 'Voir le style',
                'update_item' => 'Modifier le style',
                'add_new_item' => 'Ajouter un style',
                'new_item_name' => 'Nouveau nom de style',
                'parent_item' => 'Style parent',
                'search_items' => 'Rechercher un style',
                'popular_items' => 'Styles populaires',
                'no_found' => 'Aucun style musical trouvé.'
            ],
            'public' => true,
            'show_in_rest' => true,
            'show_admin_column' => true,
            'hierarchical' => false,
        ]);
    }
}

class RegionTaxonomy extends AgTaxonomy
{

    const SLUG = 'region';

    public static function register()
    {
        register_taxonomy(self::SLUG, ['song', 'attachement', 'post'], [
            'labels' => [
                'name' => 'Régions',
                'singular_name' => 'Région',
                'all_items' => 'Toutes les régions',
                'edit_item' => 'Editer la région',
                'view_item' => 'Voir la région',
                'update_item' => 'Modifier la région',
                'add_new_item' => 'Ajouter une région',
                'new_item_name' => 'Nouveau nom de région',
                'parent_item' => 'Région parente',
                'search_items' => 'Rechercher une région',
                'popular_items' => 'Régions populaires',
                'no_found' => 'Aucun résultat trouvé.'
            ],
            'public' => true,
            'show_in_rest' => true,
            'show_admin_column' => true,
            'hierarchical' => true,
        ]);

        // add ISO3166 meta
        add_action('saved_' . self::SLUG, [self::class, 'save']);
        add_action(self::SLUG . '_add_form_fields', [self::class, 'renderNew']);
        add_action(self::SLUG . '_edit_form_fields', [self::class, 'renderEdit'], 10, 2);
        add_filter('manage_edit-' . self::SLUG . '_columns', function ($columns) {
            // insert at 3rd position
            $beg = array_slice($columns, 0, 2);
            $middle = ['ISO3166' => 'Code'];
            $end = array_slice($columns, 2);
            $columns = array_merge($beg, $middle, $end);
            return $columns;
        });
        add_action('manage_' . self::SLUG . '_custom_column', function ($string, $column, $term_id) {
            switch ($column) {
                case 'ISO3166':
                    $iso = get_term_meta($term_id, 'ISO3166', true);
                    echo $iso ?: '-';
                    break;
            }
        }, 10, 3);
    }

    public static function save($term_id)
    {
        delete_term_meta($term_id, 'ISO3166');
        if (!empty($_POST['ISO3166'])) {
            add_term_meta($term_id, 'ISO3166', strtoupper(sanitize_text_field($_POST['ISO3166'])));
        } elseif (true) {
            $term = get_term($term_id, self::SLUG);

            self::set_country_code($term);
        }
        generate_dynamic_map_data();
    }

    public static function renderNew()
    {
?>
        <div class="form-field">
            <label for="ISO3166">Code pays</label>
            <input name="ISO3166" id="ISO3166" type="text" value="" maxlength="2" size="2" aria-describedby="ISO3166" />
            <p id="ISO3166-description">Saisir le code pays à deux lettres ( norme ISO3166 )</p>
        </div>
    <?php
    }

    public static function renderEdit(WP_Term $term = null)
    {
        if ($term) {
            $iso = get_term_meta($term->term_id, 'ISO3166', true) ?: '';
        } else {
            $iso = '';
        }
    ?>
        <tr class="form-wrap form-field">
            <th scope="row"><label for="ISO3166">Country Code</label></th>
            <td><input name="ISO3166" id="ISO3166" type="text" value="<?= $iso ?>" size="2" maxlength="2" aria-describedby="ISO3166" />
                <p class="description" id="ISO3166-description">Saisir le code à deux chiffres ISO3166</p>
            </td>
        </tr>
<?php
    }

    public static function countryNameToISO3166($country_name, $language = 'US')
    {

        if (strlen($language) != 2) {
            //Language must be on 2 caracters
            return NULL;
        }

        //Set uppercase if never
        $language = strtoupper($language);

        $countrycode_list = array('AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV', 'BR', 'IO', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'CV', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'SS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SZ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UM', 'UY', 'UZ', 'VU', 'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW');
        $ISO3166 = NULL;
        //Loop all country codes
        foreach ($countrycode_list as $countrycode) {
            $locale_cc = Locale::getDisplayRegion('-' . $countrycode, $language);
            //Case insensitive
            if (strcasecmp($country_name, $locale_cc) == 0) {
                $ISO3166 = $countrycode;
                break;
            }
        }
        //return NULL if not found or country code
        return $ISO3166;
    }

    public static function set_country_code(WP_Term $region)
    {
        if ($region->taxonomy !== RegionTaxonomy::SLUG) {
            return false;
        }
        if ($iso = self::countryNameToISO3166($region->name)) {
            return update_term_meta($region->term_id, 'ISO3166', $iso);
        }
        return false;
    }
}

class MusicLabelTaxonomy extends AgTaxonomy
{
    const SLUG = 'music_label';

    public static function register()
    {
        register_taxonomy(self::SLUG, ['song', 'attachement'], [
            'labels' => [
                'name' => 'Label',
                'singular_name' => 'Label',
                'all_items' => 'Tous les labels',
                'edit_item' => 'Editer le label',
                'view_item' => 'Voir le label',
                'update_item' => 'Modifier le label',
                'add_new_item' => 'Ajouter un label',
                'new_item_name' => 'Nouveau nom de label',
                'search_items' => 'Rechercher un label',
                'popular_items' => 'Labels populaires',
                'no_found' => 'Aucun résultat trouvé.'
            ],
            'public' => true,
            'show_in_rest' => true,
            'show_admin_column' => true,
        ]);
    }
}

class ArtistTaxonomy extends AgTaxonomy
{

    const SLUG = 'artist';

    public static function register()
    {
        register_taxonomy(self::SLUG, ['song', 'attachement'], [
            'labels' => [
                'name' => 'Artistes',
                'singular_name' => 'Artiste',
                'all_items' => 'Tous les artistes',
                'edit_item' => 'Editer l\'artiste',
                'view_item' => 'Voir l\'artiste',
                'update_item' => 'Modifier l\'artiste',
                'add_new_item' => 'Ajouter un artiste',
                'new_item_name' => 'Nouveau nom d\'artiste',
                'search_items' => 'Rechercher un artiste',
                'popular_items' => 'Artistes populaires',
                'no_found' => 'Aucun résultat trouvé.'
            ],
            'public' => true,
            'show_in_rest' => true,
            'show_admin_column' => true,
        ]);
    }
}
