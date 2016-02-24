# checks selected bounding box against data bb (only necessary if map size is shrinked). 
# if selected data point is out of range, set point to data bb and throw warning
#
setToAvailableExtent <- function(lon, lat, longitude, latitude){
  
  # check if selected test region is in bbox of selected map region; if not set to bbox dimension
  # add throw warning
  minlon_sel<- min(lon) 
  minlondata <- min(longitude)
  minlat_sel <- min(lat)
  minlatdata <- min(latitude)
  
  if (minlon_sel < minlondata | minlat_sel < minlatdata){ 
    minlatcomparison <- ifelse (checkbbdim(minlatdata, minlat_sel),F, minlat_sel <- setValueAndWarn(minlatdata,"min(lat)"))
    ifelse (checkbbdim(minlondata, minlon_sel),minlatcomparison,minlon_sel <- setValueAndWarn(minlondata,"min(lon)"))
  }
  
  maxlon_sel<- max(lon) 
  maxlondata <- max(longitude)
  maxlat_sel <- max(lat)
  maxlatdata <- max(latitude)
  
  if (maxlon_sel > maxlondata | maxlat_sel > maxlatdata){
    maxlatcomparison <- ifelse (checkbbdim(maxlatdata, maxlat_sel), maxlat_sel <- setValueAndWarn(maxlatdata,"max(lat)"), F)
    ifelse (checkbbdim(maxlondata, maxlon_sel), maxlon_sel <- setValueAndWarn(maxlondata,"max(lon)"), maxlatcomparison)
  }
   
  return(list(c(minlat_sel, maxlat_sel), c(minlon_sel, maxlon_sel)))
}