# execution schema regmod
runRegmod <- function(padding.lat, padding.lon, index.weight, regression.quality, pca.quality, grid){
  
  # paste year month for log file
  print(paste('sourceDate: ',year, ' ', month))
  
  # get index data
  indexData <- getIndexData(year, month)
  
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
  raster2mapView(reconstructed, world.longitude, world.latitude, year, month, 'recon', evCount = nrow(indexData))
  
}

getYearMonthList <- function(limit=FALSE){
  # prepare sql query from dbConf.R
  #sqlQuery <- paste('SELECT DISTINCT year, month from regmod.tambora_temperature_monthly ORDER BY year, month;' , sep='') 
  # break                                                                                          
  sqlQuery <- getYearMonthListTamboraQuery() 
  
  # get data from db
  yearMonthList <- postgresGetQuery(sqlQuery)
  
  if(limit){
    yearMonthList <- yearMonthList[1:limit,]
  }
  
  return(yearMonthList)
}