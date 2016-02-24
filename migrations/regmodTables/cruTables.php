<?php

$TABLES = array();

# create monthly cru mean data table
$TABLES['temperature_cru_mean'] = ("
    CREATE TABLE regmod.temperature_cru_mean (
    month numeric CONSTRAINT crumean UNIQUE,
    rast raster
    );
");

# create monthly cru std data table
$TABLES['temperature_cru_std'] = ("
    CREATE TABLE regmod.temperature_cru_std (
    month numeric CONSTRAINT crumstd UNIQUE,
    rast raster
    );
");     

return $TABLES;
