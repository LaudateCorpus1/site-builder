<?php
include 'inc/utils.php';

header('Content-Type: application/json');

function createBackup(){
	if (file_exists(PROJECTS_SETTINGS_FILE)) {
		$backupFilename = basename(PROJECTS_SETTINGS_FILE, '.json') . '_backup';
		$files = glob(CONTENT_PATH . "/$backupFilename*");

		if (count($files) >= NUM_BACKUPS) {
			// delete oldest file:
			array_multisort(
				array_map( 'filemtime', $files ),
				SORT_NUMERIC,
				SORT_ASC,
				$files
			);
			unlink($files[0]);
			$backupFilename = $files[0];
		}
		else {
			// add next backup file:
			$num = sprintf('%02d', count($files) + 1);
			$backupFilename = CONTENT_PATH . '/' . $backupFilename . $num . '.json';
		}


		rename(PROJECTS_SETTINGS_FILE, $backupFilename);
	}
}

if (is_ajax()) {
	//$json = json_encode($_POST, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
	$json = file_get_contents('php://input');

	createBackup();
	file_put_contents(PROJECTS_SETTINGS_FILE, $json);
	//echo $pathToJson;
	echo json_encode(array('message' => 'SUCCESS: data saved.'));
}
else {
	header('HTTP/1.1 400 Bad Request');
	//header('Content-Type: application/json; charset=UTF-8');
	die(json_encode(array('message' => 'ERROR: Data sent is not JSON.')));
}

?>
