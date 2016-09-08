<?php
$base_url = dirname($_SERVER["SCRIPT_NAME"].'?').'/';
?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Andreas Hackel</title>
	<base href="<?php echo $base_url; ?>">
	<script src="build/react-with-addons.min.js"></script>
    <script src="build/react-dom.min.js"></script>
    <script src="build/ReactRouter.min.js"></script>
    <link href="style.css" rel="stylesheet" type="text/css">
	<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" rel="stylesheet" type="text/css">
  </head>
  <body>
    <div id="root"></div>
    <script src="index.js"></script>
  </body>
</html>
