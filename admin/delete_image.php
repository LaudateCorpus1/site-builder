<?php
include 'inc/utils.php';

header('Content-Type: application/json');

if (is_ajax()) {
  	$post = json_decode(file_get_contents('php://input'), true);

	$path = $post['path'];
	$url = $post['url'];

    $success = unlink(PROJECTS_PATH . '/' . $path . '/' . $url);

    if ($success) {

		// delete thumbs:
		foreach ($thumbnailSizes as $t) {
			unlink(PROJECTS_PATH . '/' . $path . '/' . $t[0] . '/' . $url);
		}

        echo json_encode(array('message' => 'SUCCESS: $url deleted.'));
	}
    else {
        header('HTTP/1.1 500 Internal Server Error');
      	die(json_encode(array('message' => 'ERROR: could not delete $path/$url.')));
    }
}
else {
  	header('HTTP/1.1 400 Bad Request');
  	die(json_encode(array('message' => 'ERROR: data sent is not JSON.')));
}

?>
