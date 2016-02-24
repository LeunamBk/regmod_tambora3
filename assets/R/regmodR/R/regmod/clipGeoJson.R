clipGeoJson <- function(location, fileName, date, evid){
  
  #TODO: CHECK if necessary !!!!
  
  # TODO: FILEPATH HANDLING FIX THIS WITH OWN CONFIGURATION FILE!!!
  gisfolderpath <- paste(getwd(), '/www/genmaps/GISFiles/', sep='')
  sfolderpath <- location
  tfolderpath <- paste(getwd(), '/www/genmaps/geojson/', sep='')
  # TODO: check projection; something seems wired (EPSG:3857 doesnt work; EPSG:4326 makes no difference)!
  system(paste('ogr2ogr -f GeoJSON -t_srs crs:84 ', sfolderpath, '.geojson',' ', sfolderpath, sep='')) 
  # clip contour
  system(paste('ogr2ogr -clipsrc ', gisfolderpath, 'clipped_world_poly.shp ', '-f \'GeoJSON\' -overwrite ', tfolderpath, fileName, 'Clipped', date, evid, '.geojson ', sfolderpath, '.geojson' ,sep=''))

  return(paste('genmaps/geojson/', fileName, 'Clipped', date, evid, '.geojson', sep=''))

}
