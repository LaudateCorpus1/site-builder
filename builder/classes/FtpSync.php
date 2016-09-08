<?php

class FtpSync {

	public $added = 0;
	public $removed = 0;
	public $failed = 0;
	private $connection;

	private function syncDir($source, $dest) {
		//echo "sync dir: $source -> $dest\n";
		$ftp_files = array();

		if (@ftp_chdir($this->connection, $dest) == false) {
			echo "add dir: $dest...\n";
			ftp_mkdir($this->connection, $dest);
			ftp_site($this->connection, 'CHMOD 0777 '.$dest);
			$this->added++;
		}
		else {
			ftp_chdir($this->connection, '/');
			$ftp_files = ftp_nlist($this->connection, $dest);
			//print_r($ftp_files);
		}

		$handle = @opendir($source);
		if ($handle) {
			while (($file = readdir($handle))!==false) {
				if (($file[0] != ".")) {
					// this will convert spaces to '_' so that it will not throw error.  -- VK
					$ftp_filename = str_replace(" ", "_", $file);
					$this->syncFileItem("$source/$file", "$dest/$ftp_filename");

					// remove file from list:
					if(($key = array_search("$dest/$ftp_filename", $ftp_files)) !== false) {
						unset($ftp_files[$key]);
					}
				}
			}
			closedir($handle);

			//delete files on ftp that don't exist locally any more:
			foreach ($ftp_files as $ftp_file) {
				echo "remove: $ftp_file... ";
				if (ftp_rdel($this->connection, "$ftp_file")) {
					$this->removed++;
					echo "ok.\n";
				}
				else {
					$this->failed++;
					echo "failed.\n";
				}
			}
		}
		else {
			echo "ERROR: failed to read directory $source\n";
		}
	}

	private function syncFile($source, $dest) {
		$destTime = ftp_mdtm($this->connection, $dest);
		if ($destTime < filemtime($source)) {
			echo ($destTime == -1) ? "add" : "update";
			echo " file: $dest... ";

			$fp = fopen($source, "r");
			if (ftp_fput ($this->connection, $dest, $fp, FTP_BINARY)) {
				ftp_site($this->connection, "CHMOD 0755 $dest");
				$this->added++;
				echo "ok.\n";
			}
			else {
				echo "failed.\n";
			}
			fClose($fp);
		}
	}

	private function syncFileItem($source, $dest) {
		if (is_dir($source)) {
			$this->syncDir($source, $dest);
		}
		elseif (is_file($source)) {
			$this->syncFile($source, $dest);
		}
	}


	public function run ($host, $login, $password, $source, $dest) {

		$this->added = 0;
		$this->removed = 0;
		$this->failed = 0;

		echo "connecting to $host... ";
		$this->connection = ftp_connect($host, 21);

		if (!$this->connection) {
			echo "failed.\n";
			return false;
		}
		else {
			echo "ok.\n";
		}

		echo "logging in... ";
		$login_result = ftp_login($this->connection, $login, $password);
		if (!$login_result) {
			echo "failed.\n";
			return false;
		}
		else {
			echo "ok.\n";
		}

		$this->syncFileItem($source, $dest);

		echo "closing connection...\n\n";
		ftp_close($this->connection);

		if ($added == 0 && $removed == 0 && failed == 0) {
			echo "up to date.\n";
		}
		if ($added > 0) {
			echo "Added $added items.\n";
		}
		if ($removed > 0) {
			echo "Removed $removed items.\n";
		}
	}

}

?>
