<?php

header('Content-Type: application/json');

include 'inc/utils.php';

DEFINE("CONTENT_PATH", "content");
DEFINE("META_FILE", "meta.json");
DEFINE("THUMB_PATH", "_thumb");
DEFINE("DIR_THUMB_PATH", THUMB_PATH . "/_dir.jpg");

function isImageFile($path) {
	$validThumbTypes = array('jpg', 'png', 'gif');
	$ext = pathinfo($path, PATHINFO_EXTENSION);
	return in_array($ext, $validThumbTypes);
}

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

function get_meta($path, $file = '') {
	$isDir = empty($file);
	$name = basename($path);
	$meta = array('name' => $name);
	$fullPath = $path . '/' . $file;
	$metaPath = $path . '/' . $file . META_FILE;
	$thumbPath = $path . '/' . THUMB_PATH;
	$dirThumbPath = $path . '/' . DIR_THUMB_PATH;

	if (file_exists($metaPath)) {
		$meta = json_decode(file_get_contents($metaPath), true);
	}

	//if (empty($meta['thumb'])) {
		if (file_exists($thumbPath)) {
			if ($isDir && file_exists($dirThumbPath)) {
				$meta['thumb'] = DIR_THUMB_PATH;
			}
			else {
				if ($isDir)
					$thumb = getFirstImageFile($thumbPath);
				elseif (file_exists($thumbPath . '/' . $file)) {
					$thumb = $file;
				}
				if (!empty($thumb))
					$meta['thumb'] = THUMB_PATH . '/' . $thumb;
			}
		}
	//}

	if ($isDir == false) {
		if (isImageFile($fullPath)) {
			$imagesize = getimagesize($fullPath);
			//$iptc = iptcparse($info['APP13']);
			$meta['width'] = $imagesize[0];
			$meta['height'] = $imagesize[1];
			//$imagetype = $imagesize[2];
		}
	}
	return $meta;
}

function get_items($path) {
	$dirs = array();
	$files = array();

	$handle = @opendir($path);
	if ($handle) {
		while (($file = readdir($handle))!==false) {
			if ((str_ends_with($file, META_FILE) == false) && ($file[0] != ".") && ($file[0] != "_")) {
				$filePath = "$path/$file";

				if (is_dir($filePath)) {
					$item = get_meta($filePath);
					if (empty($item['hidden'])) {
						$item['name'] = $file;
						$dirs[] = $item;
					}
				}
				else {
					$item = get_meta($path, $file);
					if (empty($item['hidden'])) {
						$item['name'] = $file;
						$files[] = $item;
					}
				}

			}
		}
		closedir($handle);
	}
	return array('dirs' => $dirs, 'files' => $files);
}

function get_prev_and_next_dir($path){
    $dirs = glob(dirname($path) . "/*", GLOB_ONLYDIR);
	//print_r($path);
	//print_r($dirs);
	$i = array_search($path, $dirs);
	$prev = ($i !== false && ($i > 0)) ? $dirs[$i - 1] : NULL;
	$next = ($i !== false && ($i < count($dirs) - 1)) ? $dirs[$i + 1] : NULL;
	return array(
		'prev' => basename($prev),
		'next' => basename($next)
	);
}

try {

	if (is_ajax()) {
	  	$post = json_decode(file_get_contents('php://input'), true);
		$path = $post['path'];

		if (is_null($path))
			throw new RuntimeException('ERROR: no path specified.');

		$path = rtrim($path, "/");
		$path = ltrim($path, "/");

		$fullPath = CONTENT_PATH . '/' . $path;

		if (!file_exists($fullPath))
			throw new RuntimeException("ERROR: path '$path' not found.");

		$result = get_items($fullPath);
		$result['meta'] = get_meta($fullPath);
		$prevNext = get_prev_and_next_dir($fullPath);
		$result['prev'] = dirname($path) . '/' . $prevNext['prev'];
		$result['next'] = dirname($path) . '/' . $prevNext['next'];
		echo json_encode($result);
	}
	else
	  	throw new RuntimeException('ERROR: data sent is not JSON.');

} catch(RuntimeException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    header('Content-Type: application/json');
    die(json_encode(array('message' => $e->getMessage()), JSON_UNESCAPED_SLASHES));
}



?>
