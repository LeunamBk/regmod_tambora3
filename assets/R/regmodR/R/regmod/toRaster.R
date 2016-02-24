toRaster <- function(maps_sel, longitude_sel, latitude_sel){
  
  # flip matrix
  df <- apply(t(maps_sel),1,rev) 
  
  #rotate <- function(x) t(apply(x, 2, rev))
  #df <- rotate(maps_sel)

  # create raster object
  outRaster <- raster(df, xmn=min(longitude_sel), xmx=max(longitude_sel), ymn=min(latitude_sel), ymx=max(latitude_sel), crs=NA, template=NULL)
  
  # project raster to WGS84
  projection(outRaster) <- '+proj=longlat +datum=WGS84 +ellps=WGS84 +towgs84=0,0,0'
  
  #projection(outRaster) <- CRS("+init=epsg:3857")
  
  return(outRaster)
}
 