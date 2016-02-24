<?php

$TABLES = array();

# create reconstructed index fields table for live pca
$TABLES['temperature_monthly_regio_idxrec'] = ("
    CREATE TABLE regmod.temperature_monthly_regio_idxrec (
    event_id numeric CONSTRAINT idxrec UNIQUE,
    rast raster
    );
");

# create reconstructed regression (weightings) fields table for live pca
$TABLES['temperature_monthly_regio_weight'] = ("
    CREATE TABLE regmod.temperature_monthly_regio_weight (
    event_id numeric CONSTRAINT weight UNIQUE,
    rast raster
    );
");

# create table for reconstruction for every event_id
$TABLES['temperature_monthly_recon_single'] = ("
    CREATE TABLE regmod.temperature_monthly_recon_single (
    event_id numeric CONSTRAINT reconsingle UNIQUE,
    rast raster
    );
");

# create table for reconstruction for every event_id
$TABLES['temperature_monthly_recon'] = ("
    CREATE TABLE regmod.temperature_monthly_recon (
    year numeric, 
    month numeric,
    rast raster,
    event_count numeric,
    CONSTRAINT recon UNIQUE (year, month)
    );
");

# create table for reconstruction for every event_id
$TABLES['temperature_monthly_recon_live'] = ("
    CREATE TABLE regmod.temperature_monthly_recon_live (
    event_id_array text[],
    year numeric, 
    month numeric,
    rast raster,
    CONSTRAINT live UNIQUE (event_id_array, year, month)
    );
");

# contour lines master table
/*
$TABLES['teperature_monthly_isotherms'] = ("
    CREATE TABLE regmod.teperature_monthly_isotherms (
    ogc_fid serial NOT NULL,
    wkb_geometry geometry(LineString,4326),
    temp numeric(12,3),
    year numeric(4),
    month numeric(2),
    event_id numeric
    );
");
*/

# create regmod live event editing table
$TABLES['temperature_monthly_reconstructor_evaluation'] = ("
    CREATE TABLE regmod.temperature_monthly_reconstructor_evaluation (
    id_array text[],
    year numeric,
    month numeric,
    created date,
    rast raster,
    CONSTRAINT reconstructor UNIQUE (id_array, year, month)
    );
");

# create regmod live event editing regression table
$TABLES['temperature_monthly_reconstructor_evaluation_regression'] = ("
    CREATE TABLE regmod.temperature_monthly_reconstructor_evaluation_regression (
    id_array text[],
    year numeric,
    month numeric,
    created date,
    rast raster,
    CONSTRAINT reconstructor_regres UNIQUE (id_array, year, month)
    );
");

# create regmod live event editing regression table
$TABLES['temperature_monthly_events_update_register'] = ("
    CREATE TABLE regmod.temperature_monthly_events_update_register (
	event_id numeric,
	checksum bytea,
	created date,
	reconstructed boolean,
	CONSTRAINT update_register UNIQUE(event_id, checksum)
   );
");





return $TABLES;