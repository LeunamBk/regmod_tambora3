#returns only in CE selected, maps of selected region
selectmaps <- function(longitude, latitude, karten, lon, lat){
  
  # return  multiple or one specific map
  if (length(dim(karten)) == 3) {
    karten_sel <- karten[,which(latitude >= lat[1] & latitude <= lat[2]),which(longitude >= lon[1] & longitude <= lon[2])]
  } else {
    karten_sel <- karten[which(latitude >= lat[1] & latitude <= lat[2]),which(longitude >= lon[1] & longitude <= lon[2])]
  }
  
  latitude_sel <- latitude[latitude >= lat[1] & latitude <= lat[2]]
  longitude_sel <- longitude[longitude >= lon[1] & longitude <= lon[2]]
 
  return(list(karten_sel, longitude_sel=longitude_sel, latitude_sel=latitude_sel))
}
