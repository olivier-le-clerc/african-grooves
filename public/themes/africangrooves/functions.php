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

function ag_pagination()
{
	the_posts_pagination();
}


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
	if(is_numeric($post)){
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
		$year = str_replace('x',"0's",$year);//TODO supprimmer ligne (bdd actualisée)
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
	$separator = ', ';
	$tags = [
		'regions' => get_the_term_list($post_id, RegionTaxonomy::SLUG, '', $separator),
		'styles' => get_the_term_list($post_id, MusicalGenreTaxonomy::SLUG, '', $separator),
		'tags' => get_the_term_list($post_id, 'post_tag', '', $separator),
	];
	$res = '';
	foreach ($tags as $key => $val) {
		if ($val) {
			if ($res) {
				$res .= ', ' . $val;
			} else {
				$res = $val;
			}
		}
	}

	echo $res;
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

function get_tracks(string $search = 'recent', string $tax = '')
{
	$limit =  30;

	$data = [
		"title" => '',
		"content" => [],
	];

	if ($search == 'recent') {
		$data["title"] = 'Recent Tracks';
		$posts = get_posts([
			'numberposts' => $limit,
			'post_type' => SongPostType::SLUG,
			'post_status' => 'publish',
			'fields' => 'ids',
		]);
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
	$track_ids = array_map(fn ($e) => get_post_meta($e, 'featured-audio', true), $posts);

	foreach ($track_ids as $id) {
		$track = get_post($id);
		$image_id = get_post_thumbnail_id($id) ?? 0;
		$row = [];

		$row['post_id'] = $track->post_parent;
		$row['mp3_path'] = wp_get_attachment_url($track->ID);
		$row['image_path'] = wp_get_attachment_image_url($image_id);
		$row['song_title'] = $track->post_title;
		$row['artist'] = get_post_meta($track->ID, '_wp_attachment_metadata', true)['artist'];

		$data['content'][] = $row;
	}
	return $data;
}

// function get_ajax_tracks()
// {
// 	$search =  wp_unslash($_POST['search'] ?? false);
// 	$taxonomy = wp_unslash($_POST['taxonomy'] ?? '');
// 	if ($search) {
// 		wp_send_json(get_tracks($search, $taxonomy));
// 	}
// 	die();
// }

// function get_ajax_post()
// {
// 	$id = absint($_POST['id']);
// 	if ($id) {
// 		$res = [];
// 		global $post;
// 		$post = get_post_parent($id);
// 		setup_postdata($post);

// 		ob_start();
// 		get_template_part('parts/article');
// 		$res['content'] = ob_get_clean();

// 		wp_reset_postdata();

// 		// $res = ['content' => "test"];
// 		wp_send_json($res);
// 	}
// 	die();
// }

function get_song($id){
	$res = '';
	global $post;
	$post = get_post($id);
	setup_postdata($post);

	ob_start();
	get_template_part('parts/article');
	$res = ob_get_clean();

	wp_reset_postdata();

	return $res;
}

// function get_ajax_content($url)
// {
// 	// $url = sanitize_url($_POST['url']);
// 	if ($url) {
// 		$query = new WP_Query(wp_parse_url($url)['query']);
// 		$res = $query->get_posts();
// 		// wp_send_json($res);
// 		return $res;
// 	}
// 	// die();
// }
