<?php
header('Content-Type: application/json');

function is_ajax() {
	return isset($_SERVER['CONTENT_TYPE']) && strtolower($_SERVER['CONTENT_TYPE']) == 'application/json';
}

function searchForKey($seachValue, $array, $searchKey) {
   foreach ($array as $key => $val) {
       if (strcmp($val[$searchKey], $seachValue) == 0) {
           return $key;
       }
   }
   return -1;
}

//print_r($_SERVER);

if (is_ajax()) {
	//$json = json_encode($_POST, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
	$post = json_decode(file_get_contents('php://input'), true);

	$project = $post['project'];
	$path = $post['path'];

	if (empty($path) || $path == 'new')
		$path = strtolower(preg_replace('/\s+/', '', $project[title]));

	$project['path'] = $path;

	$pathToJson = "../content/projects.json";
	$projects = json_decode(file_get_contents($pathToJson), true);

	$index = searchForKey($path, $projects, 'path');
	if ($index > -1)
		$projects[$index] = $project;
	else
		$projects[] = $project;

	file_put_contents($pathToJson, json_encode($projects, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
	//echo $pathToJson;
	echo json_encode(array('message' => 'SUCCESS: data saved.', 'path' => $path]);
}
else {
	header('HTTP/1.1 400 Bad Request');
	//header('Content-Type: application/json; charset=UTF-8');
	die(json_encode(array('message' => 'ERROR: Data sent is not JSON.')));
}

?>
