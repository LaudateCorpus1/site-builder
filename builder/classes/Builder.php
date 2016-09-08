<?php

require "inc/utils.php";

function deleteAll($dir) {
	if (is_dir($dir)) {
		$files = array_diff(scandir($dir), array('.','..'));
		foreach ($files as $file) {
		 	deleteAll("$dir/$file");
		}
		return rmdir($dir);
	}
	else {
		return unlink($dir);
	}
}

function clean_filename($path){
	return strtolower($path);
}

class Builder {

	public $settings;

	private function processDir($source, $dest) {
		$destfiles = array();

		if (!file_exists($dest)) {
			echo "Creating directory: $dest\n";
			mkdir($dest, 0777);
		}
		else {
			$destFiles = array_diff(scandir($dest), array('.', '..'));
		}

		$handle = @opendir($source);
		if ($handle) {
			while (($file = readdir($handle))!==false) {
				if (($file[0] != ".") && ($file[0] != "_")) {
					$f = clean_filename($file);
					$this->processFileItem("$source/$f", "$dest/$f");
				}

				// remove file from list:
				if(($key = array_search($f, $destFiles)) !== false) {
					unset($destFiles[$key]);
				}
			}
		}
		closedir($handle);

		//delete dest files that don't exist any more in source:
		foreach ($destFiles as $destFile) {
			if ($destFile == $this->settings['thumbPath']) {
				// TO DO: Clean up thumb path
			}
			else {
				echo "remove: $destFile... \n";
				deleteAll("$dest/$destFile");
			}
		}

		if (createDirThumbnail($source, $dest, $this->settings['dirThumbSize']))
			echo "created directory thumbnail... \n";
	}

	private function processFile($source, $dest) {
		if (isImageFile($source)) {
			createThumbnail($source, $dest, $this->settings['thumbSizes']);
		}
		else {
			if (file_exists($dest) == false || filemtime($source) > filemtime($dest)) {
				echo "Copying: $source -> $dest\n";
				copy($source, $dest);
			}
		}
	}

	private function processFileItem($source, $dest) {
		//echo "Processing: $source -> $dest\n";

		if (is_dir($source)) {
			$this->processDir($source, $dest);
		}
		elseif (is_file($source)) {
			$this->processFile($souce, $dest);
		}
	}

	public function run($source, $dest, $settings) {
		$this->settings = $settings;
		$this->processFileItem($source, $dest);
	}

}

?>
