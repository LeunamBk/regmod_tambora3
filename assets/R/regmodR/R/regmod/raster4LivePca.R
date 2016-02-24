raster4LivePca <- function(year, month, idxvalues, map, viewType, latitude, longitude){

  ## NOTE: regular case; doasnt work on tambora system, see description writeGeotiffPython.R
  # create raster object from matrix
  # raster <- toRaster(map, longitude, latitude)
  # set raster NA value
  # raster[is.na(raster)] <- NA
  # trim raster to relevant extent
  # raster <- trim(raster)
  # write raster as geoTiff
  # writeRaster(raster, NAflag=9999, filename = getTmpTifFile(), format="GTiff", overwrite=TRUE)
  
  # write map to disk as trimed GeoTiff
  #map[is.na(map)] <- NA
  map2geotiff(map, getTmpTifFile(), latitude, longitude, trim = TRUE)
  
  # get event id
  event_id <- idxvalues[4]
  
  # get index value
  idx_val <- idxvalues[3]
  
  # write idx files to db
  writeViewToDB(year, month, viewType, getTmpTifFile(), event_id = event_id, idx_val = idx_val) 
}



