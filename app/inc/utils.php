<?php
// @flow

define("PROJECTS_PATH", CONTENT_PATH . "/projects");
define("PROJECTS_SETTINGS_FILE", CONTENT_PATH . "/projects.json");
define("NUM_BACKUPS", 10);
define("PROJECT_THUMB_SIZE", 400);
define("PROJECT_THUMB_NAME", '_project.jpg');

$thumbnailSizes = array(
	array('thumb', 400)
);

date_default_timezone_set ('Europe/Berlin');

function str_ends_with($string, $test) {
    $strlen = strlen($string);
    $testlen = strlen($test);
    if ($testlen > $strlen) return false;
    return substr_compare($string, $test, $strlen - $testlen, $testlen) === 0;
}

function file_upload_max_size() {
  static $max_size = -1;

  if ($max_size < 0) {
    // Start with post_max_size.
    $max_size = parse_size(ini_get('post_max_size'));

    // If upload_max_size is less, then reduce. Except if upload_max_size is
    // zero, which indicates no limit.
    $upload_max = parse_size(ini_get('upload_max_filesize'));
    if ($upload_max > 0 && $upload_max < $max_size) {
      $max_size = $upload_max;
    }
  }
  return $max_size;
}

function parse_size($size) {
  $unit = preg_replace('/[^bkmgtpezy]/i', '', $size); // Remove the non-unit characters from the size.
  $size = preg_replace('/[^0-9\.]/', '', $size); // Remove the non-numeric characters from the size.
  if ($unit) {
    // Find the position of the unit in the ordered string which is the power of magnitude to multiply a kilobyte by.
    return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
  }
  else {
    return round($size);
  }
}

function is_ajax() {
	 return isset($_SERVER['CONTENT_TYPE']) && strtolower($_SERVER['CONTENT_TYPE']) == 'application/json';
}


function deleteDir($dir) {
   $files = array_diff(scandir($dir), array('.','..'));
    foreach ($files as $file) {
      (is_dir("$dir/$file")) ? deleteDir("$dir/$file") : unlink("$dir/$file");
    }
    return rmdir($dir);
}

function searchForKey($searchValue, $array, $searchKey) {
   foreach ((array) $array as $key => $val) {
       if (strcmp($val[$searchKey], $searchValue) == 0) {
           return $key;
       }
   }
   return -1;
}

function unique_multidim_array($array, $key) {
    $temp_array = array();
    $i = 0;
    $key_array = array();

    foreach($array as $val) {
        if (!in_array($val[$key], $key_array)) {
            $key_array[$i] = $val[$key];
            $temp_array[$i] = $val;
        }
        $i++;
    }
    return $temp_array;
}

function getServerPathFromUrl($url) {
	$path = CONTENT_PATH.'/'.$url;
	if (substr($path, -1) != '/')
		$path .= '/';
	return $path;
}

function getAllProjects() {
    $projects = array();
    foreach(glob(PROJECTS_PATH . "/*", GLOB_ONLYDIR) as $d) {
        $projects[] = basename($d);
    }

    return $projects;
}

function comparePaths($a, $b) {
	return strcmp($a['path'], $b['path']);
}

function compareUrls($a, $b) {
	return strcmp($a['url'], $b['url']);
}

function updateSettingsFile($path, $scannedDirs, $scannedImages) {
	$cachePath = $path.CACHE_DIRECTORY.'/';
    $settingsPath = PROJECTS_SETTINGS_FILE;

	$path = basename($path);

	echo "Updating settings: {$settingsPath} <br />";
	//print_r($scannedImages);

	$projects = array();
	if (file_exists($settingsPath)) {
		$projects = json_decode(file_get_contents($settingsPath), true);
	}

	$projectIndex = searchForKey($path, $projects, 'path');
	if ($projectIndex > -1) {
		$project = $projects[$projectIndex];

		// update images:
		$images = (isset($project['images'])) ? $project['images'] : array();
		$images = array_uintersect(unique_multidim_array($images, 'url'), $scannedImages, "compareUrls");

		// add new images
		foreach ($scannedImages as $scannedImage) {
			$index = searchForKey($scannedImage['url'], $images, 'url');

			if ($index == -1) {
				$images[] = $scannedImage;
			}
			else {
				// update existing image:
				$images[$index] += $scannedImage;
			}
		}
		$project['images'] = $images;
		$projects[$projectIndex] = $project;
	}
	else
		$projects[] = array(
			'path' => $path,
			'title' => $path,
			'images' => $scannedImages
		);

	file_put_contents($settingsPath, json_encode($projects, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}

function createProjectThumbnail($path, $url,
	$scale = 1, $thumbX = 0, $thumbY = 0) {

	$fullPath = PROJECTS_PATH . "/$path/$url";

	$imagesize = getimagesize($fullPath);
	$width = $imagesize[0];
	$height = $imagesize[1];
	$srcW = $width / $scale;
	$srcH = $width / $scale;
	$srcX = -$srcW * $thumbX;
	$srcY = -$srcH * $thumbY;
	$imagetype = $imagesize[2];
	$extension = pathinfo(PROJECT_THUMB_NAME, PATHINFO_EXTENSION);
	$img = NULL;

	switch ($imagetype) {
		case IMAGETYPE_GIF:
			$img = imagecreatefromgif($fullPath);
			break;
		case IMAGETYPE_JPEG:
			$img = imagecreatefromjpeg($fullPath);
			break;
		case IMAGETYPE_PNG:
			$img = imagecreatefrompng($fullPath);
			break;
		default:
			return "Unsupported image format($imagetype): {$fullPath}<br />";
	}

	$thumbPath = PROJECTS_PATH . "/$path/thumb/" . PROJECT_THUMB_NAME;

	$tmp_img = imagecreatetruecolor( PROJECT_THUMB_SIZE, PROJECT_THUMB_SIZE );

	imagealphablending($tmp_img, false);
    imagesavealpha($tmp_img, true);

	imagecopyresampled( $tmp_img, $img, 0, 0, $srcX, $srcY,
		PROJECT_THUMB_SIZE, PROJECT_THUMB_SIZE, $srcW, $srcH );

	switch ($extension) {
		case "gif": // GIF
			imagegif($tmp_img, $thumbPath);
			break;
		case "jpg": // JPEG
			imagejpeg($tmp_img, $thumbPath);
			break;
		case "png": // PNG
			imagepng($tmp_img, $thumbPath);
			break;
	}
	return true;
}

function createThumbnails($path, $recursive = false, $purgeCache = false) {

	if (substr($path, -1) != '/')
		$path .= '/';

    global $thumbnailSizes;
    $cachePath = $path . CACHE_DIRECTORY . '/';

    if (!file_exists($path)) {
		echo "Creating directory: {$path} <br />";
		mkdir($path);
	}
	//chmod($path, 0777);

	echo "<br />--------- <br />";
	echo "Scanning directory: {$path} <br />";

	// if ($purgeCache) {
	// 	echo "Purging cache: {$purgeCache} <br />";
	// 	deleteDir($cachePath);
	// }

	$dir = opendir( $path );
	$scannedImages = array();
	$scannedDirs = array();

	while (false !== ($fname = readdir( $dir ))) {
		if ($fname[0] == "." || $fname == "cache")
			continue;

		$fullPath = $path.$fname;

		if (is_dir($fullPath)) {
			// $scannedDir = [
			// 	'path' => $fname,
			// ];
			//
			// if ($recursive) {
			// 	$dirSettings = createThumbnails($fullPath, true);
			// 	if (count($dirSettings['images']) > 0)
			// 		$scannedDir['thumbnail'] = $dirSettings['images'][0];
			// }
			//
			// $scannedDirs[] = $scannedDir;
			continue;
		}

		$info = pathinfo($fullPath);
		$filename = strtolower($info['filename']);
		$extension = strtolower($info['extension']);

		if ($filename == "" || $extension == ".." || $extension == "json" || $extension == "php")
			continue;

		$imagesize = getimagesize($fullPath);
		$width = $imagesize[0];
		$height = $imagesize[1];
		$imagetype = $imagesize[2];
		$img = NULL;


		$scannedImages[] = array(
			'width' => $width,
			'height' => $height,
			'url' => $fname,
			'date' => date("Y-m-d", filemtime($fullPath))
		);

		foreach ($thumbnailSizes as $thumbSize) {

			$cachePath = $path . $thumbSize[0] . '/';

			if (!file_exists($cachePath)) {
				echo "Creating cache folder: {$cachePath} <br />";
		    	mkdir($cachePath);
			}

			// $new_width = min($thumbSize, $width);
			// $new_height = floor( $height * ( $new_width / $width ) );

			$new_height = min($thumbSize[1], $height);
			$new_width = floor( $width * ( $new_height / $height ) );

			$thumbPath = "{$cachePath}{$filename}.{$extension}";

			if (file_exists($thumbPath) == false) {
				echo "Creating thumbnail: {$thumbPath} <br />";

				if (is_null($img)) {
					switch ($imagetype) {
						case IMAGETYPE_GIF:
							$img = imagecreatefromgif($fullPath);
							$extension = "gif";
							break;
						case IMAGETYPE_JPEG:
							$img = imagecreatefromjpeg($fullPath);
							$extension = "jpg";
							break;
						case IMAGETYPE_PNG:
							$img = imagecreatefrompng($fullPath);
							$extension = "png";
							break;
						default:
							echo "Unsupported image format($imagetype): {$fullPath}<br />";
							continue 2;
					}
				}

				$tmp_img = imagecreatetruecolor( $new_width, $new_height );

				imagealphablending($tmp_img, false);
			    imagesavealpha($tmp_img, true);

				imagecopyresampled( $tmp_img, $img, 0, 0, 0, 0, $new_width, $new_height, $width, $height );

				switch ($extension) {
					case "gif": // GIF
						imagegif($tmp_img, $thumbPath);
						break;
					case "jpg": // JPEG
						imagejpeg($tmp_img, $thumbPath);
						break;
					case "png": // PNG
						imagepng($tmp_img, $thumbPath);
						break;
				}
			}

			//$scannedImages[$thumbSize] = "{$filename}-{$new_width}x{$new_height}.{$extension}";
		}
		//$imageArray["{$fname}"] = $scannedImages;

	}
	closedir( $dir );

	//$json = json_encode($imageArray, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    //file_put_contents($cacheFilePath, $json);

	// $scannedSettings = array(
	// 	'images' => $scannedImages,
	// 	'dirs' => $scannedDirs
	// );
	//
	// updateSettingsFile($path, $scannedDirs, $scannedImages);
	return $scannedSettings;
}

function get_xmp_raw( $filepath ) {

    $max_size = 512000;     // maximum size read
    $chunk_size = 65536;    // read 64k at a time
    $start_tag = '<x:xmpmeta';
    $end_tag = '</x:xmpmeta>';
    $xmp_raw = null;

    if ( $file_fh = fopen( $filepath, 'rb' ) ) {

        $file_size = filesize( $filepath );
        while ( ( $file_pos = ftell( $file_fh ) ) < $file_size  && $file_pos < $max_size ) {
            $chunk .= fread( $file_fh, $chunk_size );
            if ( ( $end_pos = strpos( $chunk, $end_tag ) ) !== false ) {
                if ( ( $start_pos = strpos( $chunk, $start_tag ) ) !== false ) {

                    $xmp_raw = substr( $chunk, $start_pos,
                            $end_pos - $start_pos + strlen( $end_tag ) );

                }
                break;  // stop reading after finding the xmp data
            }
        }
        fclose( $file_fh );
    }
    return $xmp_raw;
}

function get_xmp_array( &$xmp_raw ) {
    $xmp_arr = array();
    foreach ( array(
        'Creator Email' => '<Iptc4xmpCore:CreatorContactInfo[^>]+?CiEmailWork="([^"]*)"',
        'Owner Name'    => '<rdf:Description[^>]+?aux:OwnerName="([^"]*)"',
        'Creation Date' => '<rdf:Description[^>]+?xmp:CreateDate="([^"]*)"',
        'Modification Date'     => '<rdf:Description[^>]+?xmp:ModifyDate="([^"]*)"',
        'Label'         => '<rdf:Description[^>]+?xmp:Label="([^"]*)"',
        'Credit'        => '<rdf:Description[^>]+?photoshop:Credit="([^"]*)"',
        'Source'        => '<rdf:Description[^>]+?photoshop:Source="([^"]*)"',
        'Headline'      => '<rdf:Description[^>]+?photoshop:Headline="([^"]*)"',
        'City'          => '<rdf:Description[^>]+?photoshop:City="([^"]*)"',
        'State'         => '<rdf:Description[^>]+?photoshop:State="([^"]*)"',
        'Country'       => '<rdf:Description[^>]+?photoshop:Country="([^"]*)"',
        'Country Code'  => '<rdf:Description[^>]+?Iptc4xmpCore:CountryCode="([^"]*)"',
        'Location'      => '<rdf:Description[^>]+?Iptc4xmpCore:Location="([^"]*)"',
        'Title'         => '<dc:title>\s*<rdf:Alt>\s*(.*?)\s*<\/rdf:Alt>\s*<\/dc:title>',
		'Copyright'     => '<dc:rights>\s*<rdf:Alt>\s*(.*?)\s*<\/rdf:Alt>\s*<\/dc:rights>',
        'Description'   => '<dc:description>\s*<rdf:Alt>\s*(.*?)\s*<\/rdf:Alt>\s*<\/dc:description>',
        'Creator'       => '<dc:creator>\s*<rdf:Seq>\s*(.*?)\s*<\/rdf:Seq>\s*<\/dc:creator>',
        'Keywords'      => '<dc:subject>\s*<rdf:Bag>\s*(.*?)\s*<\/rdf:Bag>\s*<\/dc:subject>',
        'Hierarchical Keywords' => '<lr:hierarchicalSubject>\s*<rdf:Bag>\s*(.*?)\s*<\/rdf:Bag>\s*<\/lr:hierarchicalSubject>'
    ) as $key => $regex ) {

        // get a single text string
        $xmp_arr[$key] = preg_match( "/$regex/is", $xmp_raw, $match ) ? $match[1] : '';

        // if string contains a list, then re-assign the variable as an array with the list elements
        $xmp_arr[$key] = preg_match_all( "/<rdf:li[^>]*>([^>]*)<\/rdf:li>/is", $xmp_arr[$key], $match ) ? $match[1] : $xmp_arr[$key];

        // hierarchical keywords need to be split into a third dimension
        if ( ! empty( $xmp_arr[$key] ) && $key == 'Hierarchical Keywords' ) {
            foreach ( $xmp_arr[$key] as $li => $val ) $xmp_arr[$key][$li] = explode( '|', $val );
            unset ( $li, $val );
        }
    }
    return $xmp_arr;
}

function get_xmp($filepath) {
	return get_xmp_array(get_xmp_raw( $filepath ));
}

?>
