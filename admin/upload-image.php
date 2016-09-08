<?php
header('Content-Type: application/json');


include 'inc/utils.php';

$path = $_POST['path'];
$fileName = $_POST['filename'];

//$root = getcwd();
$projectPath = PROJECTS_PATH . '/' . $path;

$errorMessages = array(
    "No error.",
    "File size larger than max file size in php.ini.",
    "File size larger than MAX_FILE_SIZE.",
    "File only partially uploaded.",
    "No file uploaded.",
    "No temp dir.",
    "Can't write file.",
    "PHP extension error."
);

try {

    if (!empty($_FILES)) {
		if (file_exists($projectPath) == false)
			if (@mkdir($projectPath, 0777, true) == false)
				throw new RuntimeException("Could not create directory $projectPath.");

        foreach ($_FILES as $file) {
            $error = $file["error"];

            if ($error == UPLOAD_ERR_OK) {
                $tmp_name = $file['tmp_name'];
                $name = $fileName;
                $newFilePath = "$projectPath/$name";

                if (file_exists($newFilePath))
                    unlink($newFilePath);

                if (move_uploaded_file($tmp_name, $newFilePath)) {
                    echo "$name: SUCCESS";
                    createThumbnails($projectPath);
                } else
                    throw new RuntimeException("Could not move uploaded file to $newFilePath.");
            }
            else
                throw new RuntimeException("Could not upload file $name. " . $errorMessages[$error]);
        }
    }
    else
        throw new RuntimeException("No files uploaded.");

 } catch(RuntimeException $e) {
     header('HTTP/1.1 500 Internal Server Error');
     header('Content-Type: application/json');
     die(json_encode(array('message' => $e->getMessage()), JSON_UNESCAPED_SLASHES));
}

?>
