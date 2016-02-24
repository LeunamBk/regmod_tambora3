# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Calculates monthly mean and std map from cru data and loads to db
#
# Clear Workspace
#rm(list=ls())
Sys.setlocale(locale="C")
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#
# CONFIGURATION:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# define area wich should read from netcdf file
dim.lon <- c(-179.75, 179.75)
dim.lat <- c(-89.75, 89.75)              

# define area wich should be stored to db
lat_window <- dim.lat
lon_window <- dim.lon

# define if data should be written with raster package gdal geotiff drivers to geotiff (FLASE)
# or with python script (TRUE)
geotiffPy = TRUE

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#
# READ FROM COMMAND LINE:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

args <- (commandArgs(TRUE))
if(length(args)!=0){
    wd <- args[[1]]
}

# set workspace path
setwd(wd)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#
# FUNCTIONS AND LIBRARIES:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

library(ncdf)
source(paste(getwd(), '/fullHeader.R', sep=''))

getCruData <- function(month, dim.lon, dim.lat){

  # open file 
  nc <- open.ncdf(getReanalysisFileNc())
  
  # map lat lon data to file cru ncdf indexing schema
  lon.start <- which(nc$dim[[1]]$val == dim.lon[1])
  lon.end <- which(nc$dim[[1]]$val == dim.lon[2])
  
  lat.start <- which(nc$dim[[2]]$val == dim.lat[1])
  lat.end <- which(nc$dim[[2]]$val == dim.lat[2])
  
  # prepare selecting vector
  dim.start <- c(lon.start, lat.start, month)
  # NOTE: netCDF package implementation differs from R logic eg: in R the selection 
  # a[1:3] of the vector c(1,2,3,4,5) returns <- 1 2 3 netcdf (and python) return 1 2 
  # R -> a[a>=from && a<=to]; netcdf and python -> a[a>=from && a<to] !!! 
  dim.end <- c((lon.end-lon.start)+1, (lat.end-lat.start)+1, 1)
  
  # get number of available years for every month
  years.available <- nc$var[[1]]$varsize[3] / 12
  
  # get vector of lat lon data
  longitude <- nc$dim[[1]]$val[lon.start:lon.end] 
  latitude <- nc$dim[[2]]$val[lat.start:lat.end] 
  
  # predefine month array like 100 81 161
  monthData <- array(NA, c(years.available, dim(longitude), dim(latitude)))

  for(j in 1:years.available){
    # read data from file for given month
    monthData[j,,] <- get.var.ncdf(nc, start=dim.start, count=dim.end)
    # set time for next month
    dim.start[3] <- dim.start[3] + 12
  }
  
  # close netcdf file
  close.ncdf(nc)
  
  # change dimensions for consistency with codebase 
  monthData <- aperm(monthData, c(1,3,2))
  
  return(list(monthData, longitude, latitude))
}

saveToDb <- function(map, longitude, latitude, tifFile, table, month, geotiffPy){
  
  if(geotiffPy){
    
    # write map to disk as GeoTiff with python script
    map2geotiff(map, tifFile, latitude, longitude, TRUE)
  
  } else {
    # write map to disk as GeoTiff with raster package
    raster <- toRaster(map, longitude, latitude)
    
    # set raster NA value
    raster[is.na(raster)] <- NA
   
    # trim map to relevant extent
    raster <- trim(raster)
  
    #write geotiff
    writeRaster(raster, filename = tifFile, NAflag=9999, format="GTiff", overwrite=TRUE)
  }
  
  # write geotiff to db as raster
  system(paste(getR2PSQLPath(),'raster2pgsql -s 4326 -N 9999 -a ', tifFile, ' ', table,' | psql -d ', getdbname(),' -U ', getdbuser(),' -p ', getdbport(), sep=''))
  
  # update raster metadata
  sqlQuery <- paste('UPDATE  ', table,'  SET  month = ', month, ' WHERE month IS NULL;', sep='')
  
  postgresSendQuery(sqlQuery)
}

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#
# RUN:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
                                         
for(i in 1:12){

  # load cru data
  res_getReanalysesData <- getCruData(i, dim.lon, dim.lat)
  maps <- res_getReanalysesData[[1]]
  longitude <- res_getReanalysesData[[2]] # longitude
  latitude <- res_getReanalysesData[[3]] # latitude
  
  # selectmaps
  res_selectedMaps <- selectmaps(longitude, latitude, maps, lon_window, lat_window)
  maps_sel <- res_selectedMaps[[1]]
  longitude <- res_selectedMaps[[2]]
  latitude <- res_selectedMaps[[3]]
  
  # calculate mean and std map from 100 months
  cruMapMean <- apply(maps_sel, c(2,3), nanmean)
  cruMapStd <- apply(maps_sel, c(2,3), sd)
  #debug_plotMapsLocal(toRaster(apply(maps_sel,c(2,3),nanmean), longitude, latitude))
  
  # write mean data to db
  tifFile <- paste(getTmpTifPath(), '/cruMapMean_100_', i, '.tif', sep='')
  saveToDb(cruMapMean, longitude, latitude, tifFile, getdbCruMeanTbl(), i, geotiffPy)
  
  # write std data to db
  tifFile <- paste(getTmpTifPath(), '/cruMapStd_100_', i, '.tif', sep='')
  saveToDb(cruMapStd, longitude, latitude, tifFile, getdbCruStdTbl(), i, geotiffPy)

}