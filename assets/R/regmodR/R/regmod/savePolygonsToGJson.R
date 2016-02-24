savePolygonsToGJson <- function(raster, filename = 'polyTemp', location, nbreaks){
  
  # works only online (filesystem permissions have to be granted before 777)   
  rc <- cut(raster, breaks= nbreaks)
  polyDat <- rasterToPolygons(rc, dissolve=T)
  
  # Write Data to geojson 
  outFileName <- paste(sample(1:100, 1), nowDate, filename, sep='')
  leafdatcpath <- paste(location, outFileName, sep='')
  writeOGR(polyDat, leafdatcpath, "polygons", driver="GeoJSON")
  
  # returns file path
  return(leafdatcpath) 
  
}