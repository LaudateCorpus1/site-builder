<?php
include 'inc/utils.php';
$base_url = str_replace('admin', '', dirname($_SERVER["REQUEST_URI"].'?'));
?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Andreas Hackel - Admin Panel</title>
	<base href="<?php echo $base_url; ?>">
	<!-- <script src="build/psd.min.js"></script> -->
	<script src="build/react-with-addons.min.js"></script>
	<script src="build/react-dom.min.js"></script>
    <link href="style.css" rel="stylesheet" type="text/css">
	<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" rel="stylesheet" type="text/css">
  </head>
  <body>
    <div id="root-admin"></div>
	<script>
		var FILE_UPLOAD_MAX_SIZE = <?php echo file_upload_max_size() ?>;
	</script>
    <script src="admin/index.js"></script>
	<div id="image"></div>
	<div id="data"></div>
  </body>
</html>
