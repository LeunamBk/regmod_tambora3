# uses gdal command line tools to relief and clip tif file to png
tif2png <- function(date, tifLocation, filename, rx_min, rx_max, ry_min, ry_max){
  print(tifLocation)

  gisfolderpath <- paste(getwd(), getGisFolderPath(), sep='')
            
  # system(paste('gdalwarp -srcnodata NA -dstnodata 9999 -t_srs EPSG:3857 ', tifLocation, ' -overwrite ', tifLocation, sep=''))
  
  ## clip global coastline polygon file by raster layer extent
  system(paste('ogr2ogr -f \'ESRI Shapefile\' ', '-overwrite ', gisfolderpath, 'clipped_world_poly.shp ', gisfolderpath, 'ne_50m_coastline_world_polygon_buffered.shp ', '-clipsrc ', rx_min,' ', ry_min, ' ', rx_max, ' ', ry_max, ' ', sep=''))
  system(paste('gdalwarp -dstnodata 9999 -cutline ', gisfolderpath, 'clipped_world_poly.shp -crop_to_cutline -dstalpha -of GTiff -overwrite ', tifLocation, ' -overwrite ', getwd(), getTmpSaveToTifPath(), 'cliped_raster.tif', sep=''))
  system(paste('gdaldem color-relief ', getwd(), getTmpSaveToTifPath(), 'cliped_raster.tif ', gisfolderpath, 'col.txt ', getwd(), getTmpSaveToTifPath(), 'color-relief.tif', sep=''))
  # system(paste('gdal_translate -of PNG -scale -co worldfile=yes ', getwd(), getTmpSaveToTifPath(), 'color-relief.tif -a_nodata 255 ', getwd(), getSaveToPngTmpPath(), filename, sep=''))
  system(paste('gdal_translate -of PNG -co worldfile=yes ', getwd(), getTmpSaveToTifPath(), 'color-relief.tif -a_nodata 255 ', getwd(), getSaveToPngTmpPath(), filename, sep=''))
  
}