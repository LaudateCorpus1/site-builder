<?php
header('Content-Type: application/json');

try {

	include 'inc/utils.php';

	if (is_ajax()) {
		$post = json_decode(file_get_contents('php://input'), true);

		$path = $post['path'];
		$url = $post['url'];
		$scale = $post['scale'];
		$thumbX = $post['thumbX'];
		$thumbY = $post['thumbY'];

		if (empty($path))
			throw new RuntimeException('ERROR: no path specified.');
		if (empty($url))
			throw new RuntimeException('ERROR: no image url specified.');
		if (empty($scale))
			throw new RuntimeException('ERROR: no image scale specified.');
		if (is_null($thumbX))
			throw new RuntimeException('ERROR: no image x offset specified.');
		if (is_null($thumbY))
			throw new RuntimeException('ERROR: no image y offset specified.');

		$error = createProjectThumbnail($path, $url, $scale, $thumbX, $thumbY);

		if ($error != true)
			throw new RuntimeException('ERROR: '.$error);
	}
	else
		throw new RuntimeException('ERROR: data sent is not JSON.');

 } catch(RuntimeException $e) {
     header('HTTP/1.1 500 Internal Server Error');
     header('Content-Type: application/json');
     die(json_encode(array('message' => $e->getMessage()), JSON_UNESCAPED_SLASHES));
}

?>
