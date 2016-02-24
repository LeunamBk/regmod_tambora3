# # # # # # # # 
# # Reset DB Connections
# library(DBI)
# lapply(dbListConnections(PostgreSQL()), dbDisconnect)

Sys.setlocale(locale="C")

# # # # # # # #  

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# CONFIGURATION:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# manual execution?
manualExe <<- TRUE

if(manualExe){
 
  # for manual use, you have to set the db credentials here for reading data
  # user
  args <- list()
  args[[4]] <- 'postgres'
  # password
  args[[5]] <- '5VbxEF4}/xzYkZA'
  # dbName 
  args[[2]] <- 'regmod3'
  # dbPort
  args[[3]] <- '5432'
  
  
  # test.maps_sel(maps, month) // cru files R matrix test against .mat data 
  source(paste('/var/www/vhosts/default/htdocs/regmodR/R/tests/tests.R', sep=''))
  
  setwd('/var/www/vhosts/default/htdocs/tambora2/modules/regmod/assets/R/regmodR/R/regmod')
  # SELECT month and year
  year <<-  1909
  month <<- 7
  
  
  # degrees of data wich are selected around the events and taken into account for computionan
  padding.lat <- c(-20, 20)
  padding.lon <- c(-20, 20)
  
  # regression quality parameter 
  regression.quality <- .9
  
  # weight of one index step to temperature
  index.weight <- .85
  
  # border of the cummulative sum of variance for the used main component from pca
  pca.quality <- .9
  
  # resolution of reanalysis data in degree
  grid <- .5
  
}

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# INCLUDE LIBRARYS & FUNCTIONS:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# includes all regmodR functions and all necessary librarys
source(paste(getwd(), '/fullHeader.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# MAIN:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 

runRegmod <- function(padding.lat, padding.lon, index.weight, regression.quality, pca.quality, grid){

  # paste year month for log file
  print(paste('sourceDate: ',year, ' ', month))
  
  # get index data
  indexData <- getIndexData(year, month)
  
  indexData <- rbind(indexData,c(56.48,2.7,1,12345))
  indexData <- rbind(indexData,c(56.48,2.7,1,12345))
  indexData <- rbind(indexData,c(49.48,11.07,1,12345))
  
  
  # get index data bounding box, region dimensions which should be taken 
  # in consideration for model calculation
  dim.lat <- c(min(indexData[,1]), max(indexData[,1])) + padding.lat 
  dim.lon <- c(min(indexData[,2]), max(indexData[,2])) + padding.lon
  
  # get cru reanalysis data for month
  world.cru <- getCruData(month, dim.lon, dim.lat)
  world.maps <- world.cru[[1]]
  world.longitude <- world.cru[[2]]
  world.latitude <- world.cru[[3]]
  
  # ignore events not located on reanalysis raster (not on land surface)
  indexData <- removeEventsNotOnCruRaster(world.maps, world.latitude, world.longitude, indexData, grid)

  # break calculation if no events available  
  if(length(indexData)==0) return(FALSE)

  ## DEBUG CHECK maps
  # print('summary reanalyses')
  # test.maps_sel(maps, month)
  
  ## regionalize  data
  # print('regionalize')
  regioData <- regionalize(indexData, world.maps, world.longitude, world.latitude, regression.quality, grid) 
  korrels_map <- regioData[[1]]
  maps_sel_incolumns <- regioData[[2]]
  region_repr_columns <- regioData[[3]]
  
  # calculate mean and Standard deviation from ~114 year monthly cru data
  cruMapMean <- apply(world.maps, c(2,3), nanmean)
  cruMapStd <- apply(world.maps, c(2,3), sd)
  
  # save regionalised and reconstructed fields for every event
  indices_rekon <- saveInterimResults(indexData, korrels_map, regression.quality, world.longitude, world.latitude, maps_sel_incolumns, cruMapMean, cruMapStd, index.weight, pca.quality)
  
  ## reconstruct temperature for all events
  # print('reconstruct')
  reconstructed <- reconstruct(indexData, indices_rekon, maps_sel_incolumns, region_repr_columns, world.latitude, world.longitude, cruMapMean, cruMapStd, index.weight, pca.quality)
  
  # to raster object
  # raster <- toRaster(reconstructed, longitude, latitude)
  
  # raster <- interpolateRaster(raster, interpolsteps= 0.1)[[2]]
  
  # trim raster only to region with not NA values
  ## ! Doasnt incorparate with postgis mapAlgebra functions for multiple raster calculations
  ## (nearly every spatial raster function)
  ## cause EVERY raster has to be aligned with EACHOTHER during a calculation! 
  ## Huge downside of postgis raster which is discussed since 2012
  ## (http://postgis.17.x6.nabble.com/ST-Mapalgebraexpr-requires-same-alignment-td4645592.html)
  ## and wount be implemented in the near future (devs dont agree with the community in this point)
  ## Every workaround (on database level, ST_Resample, ST_Transform,...) will change underlying data
  ## only out of db solutions possible (gdal_merge.py, manipulating raster on array level,...)
  
  # set raster NA value
  # raster[is.na(raster)] <- NA
  
  # trim raster to relevant extent
  # raster <- trim(raster, padding=1)
  
  # save reconstructed map as geotiff to filesystem and upload it to postgres as raster datatype
  if(!exists('manualExe')){
    raster2mapView(reconstructed, world.longitude, world.latitude, year, month, 'recon', evCount = nrow(indexData))
  }
  
}

if(manualExe){
  runRegmod(padding.lat, padding.lon, index.weight, regression.quality, pca.quality, grid)
  
}