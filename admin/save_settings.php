<?php
header('Content-Type: application/json');

function is_ajax() {
	return isset($_SERVER['CONTENT_TYPE']) && strtolower($_SERVER['CONTENT_TYPE']) == 'application/json';
}

//print_r($_SERVER);

if (is_ajax()) {
	//$json = json_encode($_POST, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
	$post = json_decode(file_get_contents('php://input'), true);

	$json = $post['settings'];
	$path = $post['path'];
	$pathToJson = "../content/{$path}/settings.json";
	file_put_contents($pathToJson, $json);
	//echo $pathToJson;
	echo json_encode(['message' => 'SUCCESS: data saved.']);
}
else {
	header('HTTP/1.1 400 Bad Request');
	//header('Content-Type: application/json; charset=UTF-8');
	die(json_encode(array('message' => 'ERROR: Data sent is not JSON.')));
}

?>
