<?php
$servidor = "localhost";
$usuario = "root";
$password = "";
$base_datos = "equipos_mycard";


$conexion = mysqli_connect($localhost, $root, $password, $equipos_mycard);

if(!$conexion) {
    die("Conexion fallida: ". mysqli_connect_error());
}
?>