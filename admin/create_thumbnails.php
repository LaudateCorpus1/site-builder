<?php

include 'inc/utils.php';

//ob_implicit_flush(1);
$projects = getAllProjects();
foreach ($projects as $project) {
	createThumbnails(PROJECTS_PATH . '/' . $project);
}

?>
