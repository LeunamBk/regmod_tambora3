# uses gdal command line tools to relief and clip tif file to png
idxTif2png <- function(idxArrayDat){

  gisfolderpath <- paste(getwd(), getGisFolderPath(), sep='')
 
  tifPathArray <- idxArrayDat[[1]]
  print(tifPathArray)
  pngPathArray <- idxArrayDat[[2]]
  idxArray.extent <- idxArrayDat[[3]]
  
  for(i in 1:length(tifPathArray)){
    rx_min <- xmin(idxArray.extent[[i]]) 
    rx_max <- xmax(idxArray.extent[[i]])
    ry_min <- ymin(idxArray.extent[[i]])
    ry_max <- ymax(idxArray.extent[[i]])
    print(rx_min)
    print(rx_max)
    print(ry_min)
    print(ry_max)

    tifLocation <- tifPathArray[[i]]  
    pngLocation <- pngPathArray[[i]]
  
    system(paste('gdalwarp -dstnodata 9999 -t_srs EPSG:3857 ', tifLocation, ' -overwrite ', getwd(), getIdxSaveToTifPath(), 'temptif.tif', sep=''))
    # clip global coastline polygon file by raster layer extent
    system(paste('ogr2ogr -f \'ESRI Shapefile\' ', '-overwrite ', gisfolderpath, 'clipped_world_poly.shp ', gisfolderpath, 'ne_50m_coastline_world_polygon_buffered.shp ', '-clipsrc ', rx_min,' ', ry_min, ' ', rx_max, ' ', ry_max, ' ', sep=''))
    system(paste('gdalwarp -dstnodata  9999 -cutline ', gisfolderpath, 'clipped_world_poly.shp -crop_to_cutline -dstalpha -of GTiff -overwrite ', getwd(), getIdxSaveToTifPath(), 'temptif.tif -overwrite ', getwd(), getIdxSaveToTifPath(), 'cliped_raster.tif', sep=''))
    system(paste('gdaldem color-relief ', getwd(), getIdxSaveToTifPath(), 'cliped_raster.tif ', gisfolderpath, 'colIdx.txt ', getwd(), getIdxSaveToTifPath(), 'color-relief.tif', sep=''))
   ##  system(paste('gdaldem color-relief ', getwd(), getIdxSaveToTifPath(), 'temptif.tif ', gisfolderpath, 'colIdx.txt ', getwd(), getIdxSaveToTifPath(), 'color-relief.tif', sep=''))
   ##  system(paste('gdaldem color-relief ', tifLocation, ' ', gisfolderpath, 'colIdx.txt ', getwd(), getIdxSaveToTifPath(), 'color-relief.tif', sep=''))
    
   system(paste('gdal_translate -of PNG -scale -co worldfile=yes ', getwd(), getIdxSaveToTifPath(), 'color-relief.tif -a_nodata 255 ', getwd(), pngLocation, sep=''))
  }
  
}