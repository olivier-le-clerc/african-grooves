<?php // Time-stamp: <2023-02-07 22:44:23 olivier>
define('AGTHEME_DIR', get_stylesheet_directory());

spl_autoload_register(function ($class) {
	$folders = ['classes', 'widgets'];
	foreach ($folders as $folder) {
		$file = get_stylesheet_directory() . '/' . $folder . '/' . $class . '.php';
		if (file_exists($file)) {
			include_once($file);
		}
	}
});

AgTheme::setup();


//attachment meta
add_filter('wp_update_attachment_metadata', function ($data, $post_id) {
	// validation données ?
	return $data;
}, 10, 2);

add_filter('wp_get_attachment_id3_keys', function ($arg) {
	$arg['year'] = 'Année';
	$arg['label'] = 'Label';
	return $arg;
});

function the_song_title(int|WP_Post $post = null)
{
	if (empty($post)) {
		$post = get_post();
	}
	if (is_numeric($post)) {
		$post = get_post($post);
	}
	$artist = get_post_meta($post->ID, AgMetaBox::META_KEYS['music_band'], true);
	$song = $post->post_title;
	echo $artist . ' &#8211; ' . $song;
}

function the_song_subtitle(WP_Post $post = null)
{
	if (empty($post)) {
		$post = get_post();
	}
	$res = [];
	$country = get_post_meta($post->ID, 'main_country', true);
	if ($country) {
		$res[] = $country;
	}
	$year = get_post_meta($post->ID, 'ag_year', true);
	if ($year) {
		$year = str_replace('x', "0's", $year); //TODO supprimmer ligne (bdd actualisée)
		$res[] = $year;
	}
	$labels = get_the_terms($post->ID, MusicLabelTaxonomy::SLUG, '', ' | ', '');
	if ($labels) {
		$labels = array_map(fn ($label) => '<a href="' . get_term_link($label) . '">' . $label->name . '</a>', $labels);
		$res[] = implode(' / ', $labels);
	}
	echo '( ' . implode(' , ', $res) . ' )';
}

function the_ag_terms(WP_Post $post = null)
{
	if (empty($post)) {
		$post = get_post();
	}
	$post_id = $post->ID;
	$before = '#';
	$separator = ', '.$before;
	$tags = [
		'regions' => get_the_term_list($post_id, RegionTaxonomy::SLUG, '', $separator),
		'styles' => get_the_term_list($post_id, MusicalGenreTaxonomy::SLUG, '', $separator),
		'tags' => get_the_term_list($post_id, 'post_tag', '', $separator),
	];
	$res = '';
	foreach ($tags as $key => $val) {
		if ($val) {
			if ($res) {
				$res .= $separator . $val;
			} else {
				$res = $val;
			}
		}
	}

	echo $res ? $before.$res : '';
}

function generate_dynamic_map_data()
{
	$color_levels = 5;

	$res = [
		"states" => [
			"default" => ["count" => "0"],
		],
		"regions" => [],
	];
	$terms = get_terms([
		'taxonomy' => RegionTaxonomy::SLUG,
		'hide_empty' => false,
		'meta_key' => 'ISO3166',

	]);
	$term_tax_ids = array_map(fn (WP_Term $e) => $e->term_taxonomy_id, $terms);
	wp_update_term_count_now($term_tax_ids, RegionTaxonomy::SLUG);

	$counts = array_map(fn ($e) => $e->count, $terms);
	$max_count = max($counts);

	foreach ($terms as $term) {

		$max_count = max($max_count, $term->count) ?? 1;

		$res["states"][get_term_meta($term->term_id, 'ISO3166', true)] = [
			'id' => get_term_meta($term->term_id, 'ISO3166', true),
			// 'term_id' => $term->term_id,
			'name' => $term->name,
			'slug' => $term->slug,
			'count' => $term->count == 0 ? 0 : 1 + (int) (($color_levels - 1) * $term->count / $max_count),
		];
	}

	$res = json_encode($res, JSON_PRETTY_PRINT | JSON_FORCE_OBJECT);
	file_put_contents(AGTHEME_DIR . '/cache/dynamic_map_data.json', $res);
}

function image_sizes_update($options)
{
	$backup = [];
	// save old options
	foreach ($options as $key => $value) {
		if ($old_value = get_option($key)) {
			$backup[$key] = $old_value;
			update_option($key, $value);
		}
	}
	update_option('ag_image_sizes_backup', $backup);
}

function image_sizes_restore()
{
	if ($backup = get_option('ag_image_sizes_backup')) {
		foreach ($backup as $key => $value) {
			update_option($key, $value);
		}
		delete_option('ag_image_sizes_backup');
	}
}

function get_tracks(string $search = 'recent', string $tax = '',$page = 1)
{
	$limit =  30;

	$data = [
		"title" => '',
		"content" => [],
	];
	// recent posts
	if ($search == 'recent') {
		$data["title"] = 'Recent Tracks';
		$posts = get_posts([
			'numberposts' => $limit,
			'post_type' => SongPostType::SLUG,
			'post_status' => 'publish',
			'fields' => 'ids',
		]);
		// free search
	} elseif (empty($tax)) {
		$data["title"] = $search;
		$posts = get_posts([
			'numberposts' => $limit,
			'post_type' => SongPostType::SLUG,
			'post_status' => 'publish',
			's' => $search,
			'fields' => 'ids',
		]);
	} else {
		// songs
		$data["title"] = $search;
		$posts = get_posts([
			'numberposts' => $limit,
			'post_type' => SongPostType::SLUG,
			'post_status' => 'publish',
			'fields' => 'ids',
			'tax_query' => [
				[
					'taxonomy' => $tax,
					'field' => 'slug',
					'terms' => sanitize_title($search)
				],
			]
		]);
	}

	// get associated tracks

	foreach ($posts as $id) {
		$track = get_featured_audio($id);
		$data['content'][] = get_track_data($track);
	}
	return $data;
}

function get_featured_audio($song_id)
{
	$track_id = get_post_meta($song_id, 'featured-audio', true);
	return get_post($track_id);
}

function get_track_data(WP_Post $track)
{
	$res = [];
	$image_id = get_post_thumbnail_id($track->ID) ?? 0;
	$res['post_id'] = $track->post_parent;
	$res['mp3_path'] = wp_get_attachment_url($track->ID);
	$res['image_path'] = wp_get_attachment_image_url($image_id);
	$res['song_title'] = $track->post_title;
	$res['url'] = get_permalink($track->post_parent);
	$res['artist'] = get_post_meta($track->ID, '_wp_attachment_metadata', true)['artist'];
	return $res;
}

function ag_tag_cloud()
{
	$tags = get_terms([
		'taxonomy' => [ArtistTaxonomy::SLUG, MusicalGenreTaxonomy::SLUG, MusicLabelTaxonomy::SLUG, ArtistTaxonomy::SLUG, RegionTaxonomy::SLUG],
		'orderby' => 'count',
		'order' => 'DESC',
		'number' => 45,
	]);
	return wp_generate_tag_cloud($tags, [
		'orderby' => 'name',
		'order' => 'DESC'
	]);
}

function replaceAudioPlayer($str)
{
	$replacement = '
	<button class="blog-button blog-button-play" data-post_id="' . get_the_ID() . '">Play Now</button>
	<button class="blog-button blog-button-share" data-src="' . get_the_permalink() . '">Share this song</button>';
	return preg_replace('/<audio.*audio>/mU', $replacement, $str, 1);
}
