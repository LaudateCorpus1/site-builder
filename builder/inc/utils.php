<?php

DEFINE('META_FILE', 'meta.json');
DEFINE("THUMB_PATH", "_thumb");
DEFINE("DIR_THUMB_PATH", THUMB_PATH . "/_dir.jpg");

date_default_timezone_set ('Europe/Berlin');

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

function get_meta($path, $file = '') {
	$name = basename($path);
	$meta = array('name' => $name);
	$metaPath = $path . '/' . $file . META_FILE;

	if (file_exists($metaPath)) {
		$meta = json_decode(file_get_contents($metaPath), true);
	}
	return $meta;
}

function isImageFile($path) {
	$validThumbTypes = array('jpg', 'png', 'gif');
	$ext = pathinfo($path, PATHINFO_EXTENSION);
	return in_array($ext, $validThumbTypes);
}

function getFirstImageFile($path) {
	global $validThumbTypes;
	$handle = opendir($path);
	if ($handle) {
		while (($file = readdir($handle))!==false) {
			$filePath = "$path/$file";
			if (is_file($filePath) && isImageFile($filePath)) {
				return $file;
			}
		}
		closedir($handle);
	}
	return NULL;
}

function createDirThumbnail($fullSourcePath, $fullDestPath, $size){
	// $path, $url,
	// $scale = 1, $thumbX = 0, $thumbY = 0) {
	$metaPath = $fullSourcePath . '/' . META_FILE;
	$thumbPath = $fullDestPath . '/' . THUMB_PATH;
	$dirThumbPath = $fullDestPath . '/' . DIR_THUMB_PATH;
	if (file_exists($dirThumbPath)) {
		if ((file_exists($metaPath) == false) ||
			(filemtime($dirThumbPath) > filemtime($metaPath))) {
			//echo "$dirThumbPath already exists...\n";
			return false;
		}
	}

	$meta = get_meta($fullSourcePath);
	//print_r($meta);
	$thumbName = (empty($meta['thumb'])) ? getFirstImageFile($fullSourcePath) : $meta['thumb'];

	if (empty($thumbName)) {
		//echo "No thumbnail specified...\n";
		return false;
	}

	$scale = (empty($meta['thumbScale'])) ? 1 : $meta['thumbScale'];
	$thumbX = (empty($meta['thumbX'])) ? 0 : $meta['thumbX'];
	$thumbY = (empty($meta['thumbY'])) ? 0 : $meta['thumbY'];

	$fullPath = "$fullSourcePath/$thumbName";

	$imagesize = getimagesize($fullPath);
	$width = $imagesize[0];
	$height = $imagesize[1];
	$srcW = $width / $scale;
	$srcH = $width / $scale;
	$srcX = -$srcW * $thumbX;
	$srcY = -$srcH * $thumbY;
	$imagetype = $imagesize[2];
	$extension = pathinfo($dirThumbPath, PATHINFO_EXTENSION);
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

	$tmp_img = imagecreatetruecolor( $size, $size );

	imagealphablending($tmp_img, false);
    imagesavealpha($tmp_img, true);

	imagecopyresampled( $tmp_img, $img, 0, 0, $srcX, $srcY,
		$size, $size, $srcW, $srcH );

	switch ($extension) {
		case "gif": // GIF
			imagegif($tmp_img, $dirThumbPath);
			break;
		case "jpg": // JPEG
			imagejpeg($tmp_img, $dirThumbPath);
			break;
		case "png": // PNG
			imagepng($tmp_img, $dirThumbPath);
			break;
	}
	return true;
}

function createThumbnail($fullSourcePath, $fullDestPath, $sizes) {
	$supportedFileTypes = array('jpg', 'gif', 'png');

	$info = pathinfo($fullSourcePath);
	$sourcePath = $info['dirname'] . '/';
	$filename = $info['filename'];
	$extension = strtolower($info['extension']);

	if (!in_array($extension, $supportedFileTypes))
		return false;

	$info = pathinfo($fullDestPath);
	$destPath = $info['dirname'] . '/';

	$imagesize = getimagesize($fullSourcePath);
	$width = $imagesize[0];
	$height = $imagesize[1];
	$imagetype = $imagesize[2];
	$img = NULL;

	foreach ($sizes as $thumbName => $thumbSize) {

		if ($thumbName == 'default')
			$cachePath = $destPath;
		else
			$cachePath = $destPath . $thumbName . '/';

		if (!file_exists($cachePath)) {
			//echo "Creating cache folder: {$cachePath} <br />";
	    	mkdir($cachePath);
		}

		// $new_width = min($thumbSize, $width);
		// $new_height = floor( $height * ( $new_width / $width ) );

		$new_height = min($thumbSize, $height);
		$new_width = floor( $width * ( $new_height / $height ) );

		$thumbPath = "{$cachePath}{$filename}.{$extension}";

		if (file_exists($thumbPath) == false || filemtime($fullSourcePath) > filemtime($thumbPath)) {
			echo "Creating thumbnail: {$thumbPath}\n";

			if (is_null($img)) {
				switch ($imagetype) {
					case IMAGETYPE_GIF:
						$img = imagecreatefromgif($fullSourcePath);
						$extension = "gif";
						break;
					case IMAGETYPE_JPEG:
						$img = imagecreatefromjpeg($fullSourcePath);
						$extension = "jpg";
						break;
					case IMAGETYPE_PNG:
						$img = imagecreatefrompng($fullSourcePath);
						$extension = "png";
						break;
					default:
						echo "Unsupported image format($imagetype): {$fullSourcePath}\n";
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
	}
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

function ftp_rdel ($handle, $path) {

	if (@ftp_delete ($handle, $path) === false) {

	    if ($children = @ftp_nlist ($handle, $path)) {
	      	foreach ($children as $p)
	        	ftp_rdel ($handle,  $p);
	    }

    	return @ftp_rmdir ($handle, $path);
  	}
	else {
		return true;
	}
}

?>
