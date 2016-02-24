# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Calculates monthly mean and std map from cru data and loads to db as 
# postgis raster with WGS84
#
# Clear Workspace
#rm(list=ls())
Sys.setlocale(locale="C")
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# get all functions
source(paste(getwd(), '/regmodR/fullHeader.R', sep=''))

# location window select
# Kerneuropa
lat_window <- c(30, 70)
lon_window <- c(-30, 50)

for(i in 1:12){
  res_getReanalysesData <- getReanalysisData(i)
  time <- res_getReanalysesData[[1]] # time
  longitude <- res_getReanalysesData[[2]] # longitude
  latitude <- res_getReanalysesData[[3]] # latitude
  maps <- res_getReanalysesData[[4]]
  
  # selectmaps
  res_selectedMaps <- selectmaps(longitude, latitude, maps, lon_window, lat_window)
  maps_sel <- res_selectedMaps[[1]]
  longitude <- res_selectedMaps[[2]]
  latitude <- res_selectedMaps[[3]]
  cruMapMean <- apply(maps_sel, c(2,3), mean1)
  cruMapStd <- apply(maps_sel, c(2,3), sd)
  
  # save mean as local R object for less computation
  filePath <- paste('cruMeanMonth_',i,'.RData', sep="")
  save(cruMapMean, file = filePath)
  save.image()
  unlink(filePath)
  unlink(".RData")
  
  # save std as local R object for less computation
  filePath <- paste('cruStdMonth_',i,'.RData', sep="")
  save(cruMapStd, file = filePath)
  save.image()
  unlink(filePath)
  unlink(".RData")
  
  saveToDb <- function(map, longitude, latitude, tifFileLocation, table, month){
    # reconres[is.na(reconres)] <- 9999
    
    raster <- toRaster(map, longitude, latitude)
    
    # set raster NA value
    raster[is.na(raster)] <- NA
    
    # get raster extent
    xmin <- xmin(extent(raster))
    ymin <- ymin(extent(raster))
    xmax <- xmax(extent(raster))
    ymax <- ymax(extent(raster))
 
    #write geotiff
    writeRaster(raster, filename = tifFileLocation, NAflag=9999, format="GTiff", overwrite=TRUE)
    
    # db calls
    system(paste(getR2PSQLPath(),'raster2pgsql -s 4326 -a ', tifFileLocation,' public.', table,' | psql -d ', getdbname(),' -U ', getdbuser(), sep=''))
    sqlQuery <- paste('UPDATE  ', table,'  SET  month = ', month,', idx_xmin = ', xmin,' , idx_xmax = ', xmax, ', idx_ymin = ', ymin, ', idx_ymax = ', ymax, ' WHERE month IS NULL;', sep='')
    
    postgresSendQuery(sqlQuery)
  }

  # write mean data to db
  tifFileLocation <- paste(getwd(), '/www/genmaps/tif/temperature/cruMapMean_100_', i, '.tif', sep='')
  saveToDb(cruMapMean, longitude, latitude, tifFileLocation, 'crumapsmean100', i)
  
  # write std data to db
  tifFileLocation <- paste(getwd(), '/www/genmaps/tif/temperature/cruMapStd_100_', i, '.tif', sep='')
  saveToDb(cruMapStd, longitude, latitude, tifFileLocation, 'crumapsstd100', i)
}