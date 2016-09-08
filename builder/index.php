<pre>
<?php

require_once './classes/Builder.php';
require_once './classes/FtpSync.php';

DEFINE("SETTINGS_PATH", "settings.json");

ob_end_flush();
ob_implicit_flush();

if (!file_exists(SETTINGS_PATH)) {
	exit(SETTINGS_PATH . " does not exist.\n");
}

$settings = json_decode(file_get_contents(SETTINGS_PATH), true);

$builder = new Builder();
$builder->run(
	getcwd().'/'.$settings['sourcePath'],
	getcwd().'/'.$settings['destPath'],
	$settings
);

echo "Compiling finished.\n";

if ($settings['ftpUpload'] != false) {
	$ftpSync = new FtpSync();
	$ftpSync->run(
		$settings['ftpHost'],
		$settings['ftpLogin'],
		$settings['ftpPassword'],
		getcwd().'/'.$settings['destPath'],
		$settings['ftpPath']
	);
}


?>
</pre>
