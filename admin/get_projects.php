<?php

include 'inc/utils.php';

header('Content-Type: application/json');

//print_r($_SERVER);

function getDirectorySize( $path )
{
    if( !is_dir( $path ) ) {
        return 0;
    }

    $path   = strval( $path );
    $io     = popen( "ls -ltrR {$path} |awk '{print \$5}'|awk 'BEGIN{sum=0} {sum=sum+\$1} END {print sum}'", 'r' );
    $size   = intval( fgets( $io, 80 ) );
    pclose( $io );

    return $size;
}


$projects = array();
$newProjects = array();

if (file_exists(PROJECTS_SETTINGS_FILE))
	$projects = json_decode(file_get_contents(PROJECTS_SETTINGS_FILE), true);

foreach(glob(PROJECTS_PATH . "/*", GLOB_ONLYDIR) as $d) {
	$path = basename($d);
	$i = searchForKey($path, $projects, 'path');
	$project = array('path' => $path, 'images' => array());
	if ($i >= 0)
		$project = $projects[$i];

	$images = $project['images'];
	$newImages = array();
	foreach(glob($d . "/*") as $f) {
		if (is_dir($f) == false) {
			$url = basename($f);
			$i = searchForKey($url, $images, 'url');
			$image = array('url' => $url);
			if ($i >= 0)
				$image = $images[$i];

			$imagesize = getimagesize($f);
			//$iptc = iptcparse($info['APP13']);
			$width = $imagesize[0];
			$height = $imagesize[1];
			$imagetype = $imagesize[2];

			//$exif = array();
			//$exif = @exif_read_data ($f);
			$xmp = get_xmp($f);

			$image['width'] = $width;
			$image['height'] = $height;
			if (!isset($image['date']))
				$image['date'] = date("Y-m-d", filemtime($f));
			if (!isset($image['copyright']))
				$image['copyright'] = $xmp['Copyright'][0];
			if (!isset($image['artist']))
				$image['artist'] = $xmp['Creator'][0];
			// if (!isset($image['software']))
			// 	$image['software'] = $exif['Software'];
			if (!isset($image['title']))
				$image['title'] = $xmp['Title'][0];
			// if (!isset($image['tags']) && isset($xmp['Keywords']))
			// 	$image['tags'] = join(',', $xmp['Keywords']);
			$image['fileSize'] = filesize($f);
			$newImages[] = $image;
		}
	}
	$project['images'] = $newImages;
	$project['dirSize'] = getDirectorySize($d);

	if ($project['path'] == '_vault') {
		$project['locked'] = true;
		$project['visible'] = false;
	}

    $newProjects[] = $project;
}

echo json_encode($newProjects);

?>
