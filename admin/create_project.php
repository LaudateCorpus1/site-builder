<?php
include 'inc/utils.php';

header('Content-Type: application/json');

try {

	if (is_ajax()) {
	  	$post = json_decode(file_get_contents('php://input'), true);

		$path = $post['path'];

		if (empty($path))
			throw new RuntimeException('ERROR: no path specified.');

		$fullPath = PROJECTS_PATH . '/' . $path;

		if (file_exists($fullPath))
			throw new RuntimeException('ERROR: $path already exist.');

	    $success = mkdir($fullPath);

	    if ($success) {
	        echo json_encode(array('message' => 'SUCCESS: $path created.'));
			//createThumbnails($path);
		}
	    else
	      	throw new RuntimeException('ERROR: could not create $path.');
	}
	else
	  	throw new RuntimeException('ERROR: data sent is not JSON.');

} catch(RuntimeException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    header('Content-Type: application/json');
    die(json_encode(array('message' => $e->getMessage()), JSON_UNESCAPED_SLASHES));
}

?>
