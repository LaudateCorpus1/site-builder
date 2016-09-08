<?php
include 'inc/utils.php';

header('Content-Type: application/json');

if (is_ajax()) {
  	$post = json_decode(file_get_contents('php://input'), true);

	$sourcePath = $post['sourcePath'];
	$destPath = $post['destPath'];
	$url = $post['url'];

	$fullSourceUrl = PROJECTS_PATH . '/' . $sourcePath . '/' . $url;
	$fullDestUrl = PROJECTS_PATH . '/' . $destPath . '/' . $url;

    $success = rename($fullSourceUrl, $fullDestUrl);

    if ($success) {

		// move thumbs:
		foreach ($thumbnailSizes as $t) {
			$thumbDestPath = PROJECTS_PATH . '/' . $destPath . '/' . $t[0];
			if (file_exists($thumbDestPath) == false)
				if (@mkdir($thumbDestPath, 0777, true) == false)
					throw new RuntimeException("Could not create directory $thumbDestPath.");

			$fullThumbSourceUrl = PROJECTS_PATH . '/' . $sourcePath . '/' . $t[0] . '/' . $url;
			$fullThumbDestUrl = $thumbDestPath . '/' . $url;
			rename($fullThumbSourceUrl, $fullThumbDestUrl);
		}

        echo json_encode(array('message' => 'SUCCESS: $url moved.'));
	}
    else {
        header('HTTP/1.1 500 Internal Server Error');
      	die(json_encode(array('message' => 'ERROR: could not move $sourcePath/$url.')));
    }
}
else {
  	header('HTTP/1.1 400 Bad Request');
  	die(json_encode(array('message' => 'ERROR: data sent is not JSON.')));
}

?>
