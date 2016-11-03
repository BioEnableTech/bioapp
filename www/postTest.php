<?php
header('Access-Control-Allow-Origin: *'); 

if(isset($_POST))
{
	echo "post";
	print_r($_POST);
}
else
{
	echo "get";
	print_r($_GET);
}

?>