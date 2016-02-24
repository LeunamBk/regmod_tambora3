map2geotiff <- function(map, tmpFile, lat, lon, trim = FALSE){
  
  ## NOTE: writeRaster doasnt work on the tambora system for writing GeoTiff files 
  ##       therefore multiple workarounds were tested (writing arc ascii files; direct piping commands to R interpreter, etc.)
  ##       which resulted in data offsets (ascci driver could not deal with different x/y resolutions therefore floating point
  ##       errors were introduced), therefore the underlying python script routine was written.
  # matrix to raster object
  # raster <- toRaster(map, longitude, latitude)
  # write raster as geotiff 
  # writeRaster(raster, filename = tifFileLocation, format="ascii", overwrite=TRUE)

  # write csv file which is read by the python script 
  write.table(map, file = tmpFile, sep = ";", dec = ".", row.names = FALSE, col.names = FALSE)

  # define system command string for python script writing geotiff files from R csv data 
  if(trim){
    command <- paste("python ", getwd(),"/csv2geotiff.py -s ", tmpFile, " -d ", tmpFile, " -e=", min(lat), ",", max(lat), ",", min(lon), ",", max(lon), " -t", sep="")
    } else {
    command <- paste("python ", getwd(),"/csv2geotiff.py -s ", tmpFile, " -d ", tmpFile, " -e=", min(lat), ",", max(lat), ",", min(lon), ",", max(lon), sep="")
    }
  
  # execute python script
  system(command)
  
}