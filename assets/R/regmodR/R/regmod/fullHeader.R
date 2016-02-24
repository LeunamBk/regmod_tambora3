# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Header file which includes all necessary librarys and functions for regmodR
#
# date: 10.3.2015
# author: Manuel Beck
# email: manuelbeck@outlook.com
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# LIBRARYS:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
            
library(RPostgreSQL)
library(sp)
library(raster)
library(rgdal)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# FUNCTIONS:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 

# execution routine for the regmod model
#  runRegmod (padding.lat, padding.lon, index.weight, regression.quality, pca.quality, grid)
source(paste(getwd(), '/runRegmod.R', sep=''))
  
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# loads CRU reanalysis data for selected month from RObject file in CRU_Data folder

# loadReanalysisData(month)
source(paste(getwd(), '/getReanalysisData.R', sep=''))

# input:
# numeric month 1 - 12
#------------------------------------------------------------------------
# res_getReanalysisData <- loadReanalysesData(month)
# output: 
#   time <- res_getReanalysisData[[1]] # time
#   longitude <- res_getReanalysisData[[2]] # longitude
#   latitude <- res_getReanalysisData[[3]] # latitude
#   maps <- res_getReanalysisData[[4]] # maps
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# trims loaded reanalyses Data to selected lat lon window extent
# => 100 maps for selected month

# selectmaps(longitude, latitude, maps, lon, lat)
source(paste(getwd(), '/selectmaps.R', sep=''))

# input:
# longitude             from loadReanalysesData
# latitude              from loadReanalysesData
# maps                  from loadReanalysesData
# lon                   from configuration lon_window
# lat                   from configuration lat_window
#------------------------------------------------------------------------
# res_selectedMaps <- selectmaps(longitude, latitude, maps, lon_window, lat_window)
# output: 
#   maps_sel <- res_selectedMaps[[1]] # 100 reanaliysis maps for bbox and month
#   longitude_sel <- res_selectedMaps[[2]] # corresponding lon vector
#   latitude_sel <- res_selectedMaps[[3]] # corresponding lat vector
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# calculates correlation fields for each index point and pass results to reconstruct for
# pca and temperature reconstruction

# TODO: split to more generic functions

# regionalize(indexwerte, instrumente, longitude, latitude, schwelle_index, schwelle_temp, a1 = .85)
source(paste(getwd(), '/regionalize.R', sep=''))

# input:
# indexData           from getIndexData
# maps_sel            from selectedMaps
# longitude_sel       from selectedMaps
# latitude_sel        from selectedMaps
# schwelle_index      .9
# schwelle_temp       .9
# a1                  .85
#------------------------------------------------------------------------
# res_regionalize <- regionalize(indexwerte, instrumente, longitude, latitude, schwelle_index, schwelle_temp, a1 = .85) 
# output: 
#   maps_sel <- res_regionalize 
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# calculates the pca for the appropriate month and index point region and reconstructs the temperature 
# based on the mlr results 

# reconstruct(idxvalue, indices_rekon, maps_sel_incolumns, region_repr_columns, latitude, longitude, maps_sel, a1)
source(paste(getwd(), '/reconstructTemp.R', sep=''))

# input:
# idxvalue                row of indexpoint data lat, lon, idx_value, event_id
# indices_rekon           map matrix with corredponding index values in cells of regression area                
# maps_sel_incolumns      matrix 100 months from cru, one map per row
# region_repr_columns     vector of corredponding index values in cells of regression area 
# latitude                latitude vector of map
# longitude               longitude vector of map
# cruMapMean              double; mean of 100 months cru temperature
# cruMapStd               double; standard deviation of 100 months cru temperature
# a1                      .85
#------------------------------------------------------------------------
# reconres <- reconstruct(idxvalues, indices_rekon, maps_sel_incolumns, region_repr_columns, latitude, longitude, maps_sel, a1)
# output: 
#   matrix map of recunstructed temperature for index data point
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# creates raster object represenatation of matrix data and projects it to WGS84

# toRaster(map, longitude, latitude)
source(paste(getwd(), '/toRaster.R', sep=''))

# input:
# map           map matrix
# longitude     longitude vector of map                
# latitude      latitude vector of map              
#------------------------------------------------------------------------
# raster <- toRaster(map, longitude, latitude)
# output: 
#   raster object with WGS84
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
       
# transposes 3d matrix array to 2d vector matrix
# TODO: last occurence in maps_multiple_regression please substitute!

# maps2columns(maps)
source(paste(getwd(), '/maps2columns.R', sep=''))

# input:
# maps          from configuration
#------------------------------------------------------------------------
# maps2columns(maps)
# output: 
#
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
  
# calculates a mlr between the pca loadings and the index data cells

# maps_multiple_regression(prediktoren, prediktant)
source(paste(getwd(), '/maps_multiple_regression.R', sep=''))

# input:
# prediktoren   principal components (loadings) for index point and cell 
# prediktant    matrix with index value in correlating cells               
#------------------------------------------------------------------------
# mregres <- maps_multiple_regression(pcs, indices_rekon * a1)
# output: 
#   reconstructed <- mregres[[1]]   # vector of recunstructed temperator for each cell   
#   coefficients <- mregres[[2]]    # vector of mlr with hk's coefficients 
#------------------------------------------------------------------------
  
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #  
       
# calculates contour lines (isotherms) for given raster saves to file and database

# saveContourtoGJson <- function(raster, tifFileLocation, filenameGj, year, month, evid, cmin = -30, cmax = 40, cstep=1){
source(paste(getwd(), '/saveContourtoGJson.R', sep=''))

# input:
# raster            raster object 
# tifFileLocation   string path and filename for tif     
# filenameGj        string path and filename for geojson
# year              integer YYYY 
# month             integer 1-12
# evid              integer event_id from indexvalues
# cmin              integer min class (default -30 °C) for contour lines
# cmax              integer max class (default 40 °C) for contour lines
# cstep             integer contour lines step
#------------------------------------------------------------------------
# saveContourtoGJson <- function(raster, tifFileLocation, filenameGj, year, month, evid, cmin = -30, cmax = 40, cstep=1){
# output: 
#   saveContourtoGJson  # string filepath of created geojson
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #  

# fetches index points data for year month combo from database and set their location 
# to appropriate .5 grid

# getIndexData(year, month)
source(paste(getwd(), '/getIndexData.R', sep=''))

# input:
# year          numeric YYYY from configuration
# month         numeric 1-12 from configuration
#------------------------------------------------------------------------
# indexdatapoints <-getIndexData(year, month)
# output: 
#   dataframe with lat, lon, idx_value and event_id of index points for selected year month combo 
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# transform maps in columns to one map for every column 2d -> 3d array

# columns2maps(columnMaps, lengthlon)
source(paste(getwd(), '/columns2maps.R', sep=''))

# input:
# columnMaps          matrix from correlation analysis with every map as vector
# lengthlon           number of cells in longitunal direction              
#------------------------------------------------------------------------
# korrels_map <- columns2maps(columnMaps, lengthlon)
# output: 
#   3d array with correlation maps for every index point
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# not in use

# savePolygonsToGJson(raster, filename = 'polyTemp', location, nbreaks)
source(paste(getwd(), '/savePolygonsToGJson.R', sep=''))
              
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#not in use

# interpolateRaster(raster, filename = 'interpolateTemp', location, interpolsteps= 0.1)
source(paste(getwd(), '/interpolateRaster.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# warnings // diffrent warning methods
source(paste(getwd(), '/warnings.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# writeViewToDB(year, month, viewType, locationPng, xmin, xmax, ymin, ymax, locationGjson, numDatPoints)
source(paste(getwd(), '/writeViewToDB.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# raster2mapView(raster, longitude, latitude, year, month, viewType, numDatPoints, event_id = 0, idx_val = 999999)
source(paste(getwd(), '/raster2mapView.R', sep=''))

# raster2mapView(raster, longitude, latitude, year, month, viewType, numDatPoints, event_id = 0, idx_val = 999999)
# input:
# raster             raster Object 
# longitude          integer num of cells in longitudinal direction
# latitude           integer num of cells in latitudinal y direction
# year               integer year YYYY
# month              integer month 1-12
# viewType           string 'recon' or 'single' for naming output files (deprected since every indexfield is calculated independently) 
# numDatPoints       integer number of datapoints for month (deprected since every indexfield is calculated independently) 
# event_id           integer event id of indexpoint
# idx_val            intgeger index value from -3 to 3
#------------------------------------------------------------------------
# viewString <- raster2mapView(raster, longitude, latitude, year, month, viewType, numDatPoints, event_id = 0, idx_val = 999999)
# output: 
#   viewString # string of created files locations seperated by @ for shiny server leaflet rendering
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# raster4LivePca(idxvalues[i,], region_repr_single, maps_sel_incolumns, region_repr_columns_single, latitude, longitude, cruMapMean, cruMapStd, a1)
source(paste(getwd(), '/raster4LivePca.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# max1(data), mean1(data)
source(paste(getwd(), '/shorthandfunctions_small.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# getdbHost(), getdbuser(), getdbpsw(), getdbname() 
source(paste(getwd(), '/dbconfig.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# tif2png(date, pngFileLocation, rx_min, rx_max, ry_min, ry_max)
source(paste(getwd(), '/tif2png.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# clipGeoJson(fileName)
source(paste(getwd(), '/clipGeoJson.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# writeIdxFieldViewToDB(event_id, year, month, viewType= 'idx', locationPng, xmin, xmax, ymin, ymax, idxArray)
source(paste(getwd(), '/writeIdxFieldViewToDB.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# getIdxPngPath(), getSaveToTifPath()
source(paste(getwd(), '/filePathConf.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# idxArray2mapView(raster, longitude_sel, latitude_sel, year, month, event_id, viewType)
source(paste(getwd(), '/idxArray2mapView.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# saves the regionalised weigting and indices fields for every event to db and also triggers
# the reconstruction and storing of temperature fields for every single event (independent).

# saveInterimResults(indexvalues, korrels_map, schwelle_index, longitude, latitude, maps_sel_incolumns, cruMapMean, cruMapStd, a1)
source(paste(getwd(), '/saveInterimResults.R', sep=''))

# input:
# indexvalues          matrix from correlation analysis with every map as vector
# korrels_map           number of cells in longitunal direction   
# schwelle_index
# longitude
# latitude
# maps_sel_incolumns
# cruMapMean
# cruMapStd
# a1
#------------------------------------------------------------------------
# output: 
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# # checks selected bounding box against cru data bb. 
# if selected data point is out of range, set point to data bb and throw warning
# setToAvailableExtent(lon, lat, longitude, latitude)
source(paste(getwd(), '/setToAvailableExtent.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# uses gdal command line tools to relief and clip tif file to png
# idxTif2png(idxArrayDat)
source(paste(getwd(), '/idxTif2png.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# writes 2d array to csv and executes python script for GeoTiff creation  (necessary for GDAL rster2pgsql db upload)
# NOTE: this is a workaround for the tambora system; please read description in file
# map2geotiff(map, tmpFile, lat, lon, trim = FALSE)
source(paste(getwd(), '/writeGeotiffPython.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# excludes all events wich are not located on the reanalysis raster (and therefore not on landsurface)
# from calculation
# removeEventsNotOnCruRaster(world.maps, world.latitude, world.longitude, indexData)
source(paste(getwd(), '/removeEventsNotOnCruRaster.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# writes the id, the checksum and the creation date of reconstructed event to db for later update functionality
# registerRecontructedEvent(event_id)
source(paste(getwd(), '/registerRecontructedEvent.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# common postgres query schemes

# postgresSendQuery(query), postgresGetQuery(query),  getPsqlAsMat(sqlQuery, x = FALSE, y = FALSE)
source(paste(getwd(), '/postgresInteraction.R', sep=''))


# querys the database without returning results

# postgresSendQuery(query)
# input:
# query             string postgres sql query string  
#------------------------------------------------------------------------
# postgresSendQuery(query)
# output: 
#   none
#------------------------------------------------------------------------


# querys the database and returns the results

# postgresGetQuery(query)
# input:
# query             string postgres sql query string 
#------------------------------------------------------------------------
# resQuery <- postgresSendQuery(query)
# output: 
#   resQuery # df with query results
#------------------------------------------------------------------------


# querys the database for raster and returns the raster data as matrix

# getPsqlAsMat(query, x = FALSE, y = FALSE)
# input:
# query             string postgres sql query string 
# x                 integer num of cells in raster x direction
# y                 integer num of cells in raster y direction
#------------------------------------------------------------------------
# resQuery <- postgresSendQuery(query)
# output: 
#   resQuery # matrix with raster values
#------------------------------------------------------------------------

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
 # # # # # # # # # # # # # DEBUG FUNCTIONS # # # # # # # # # # # # # # #   
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# debug_plotMapsLocal(maps_sel, longitude_sel, latitude_sel)
# source(paste(getwd(), '/debug_plotMapsLocal.R', sep=''))
       
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

#tic(), toc(), 
# test.maps_sel(maps, month) // cru files R matrix test against .mat data 
#source(paste(getwd(), '/R/tests/tests.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #