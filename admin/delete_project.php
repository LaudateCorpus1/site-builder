<?php
//error_reporting(E_ERROR);
include 'inc/utils.php';

header('Content-Type: application/json');

// function updateSettings($path) {
// 	$pathToJson = "../content/projects.json";
// 	$projects = json_decode(file_get_contents($pathToJson), true);
//
// 	$index = searchForKey($path, $projects, 'path');
// 	if ($index > -1)
// 		array_splice($projects, $index, 1);
//
// 	file_put_contents($pathToJson, json_encode($projects, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
// }
//
try {

	if (is_ajax()) {
	  	$post = json_decode(file_get_contents('php://input'), true);

		$path = $post['path'];

		if (empty($path))
			throw new RuntimeException('ERROR: no path specified.');

		$fullPath = PROJECTS_PATH . '/' . $path;

		if (!file_exists($fullPath))
			throw new RuntimeException('ERROR: $path does not exist.');

		if (!is_writable($fullPath))
			throw new RuntimeException('ERROR: $path is not writable.');

	    $success = deleteDir($fullPath);

	    if ($success) {
			//updateSettings($path);
	        echo json_encode(array('message' => 'SUCCESS: $path deleted.'));
		}
	    else
	      	throw new RuntimeException('ERROR: could not delete $path.');
	}
	else
	  	throw new RuntimeException('ERROR: data sent is not JSON.');

} catch(RuntimeException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    header('Content-Type: application/json');
    die(json_encode(array('message' => $e->getMessage()), JSON_UNESCAPED_SLASHES));
}

?>
