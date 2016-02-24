saveContourtoGJson <- function(tifFileLocation, year, month, evid){
  
  # Create Contour File and write direkt to db (table has to be copied into final table append not possible with gdal_contour)
  conString <- paste("PG:host=", getdbHost(), " user=", getdbuser(), " dbname=", getdbname(), " password=", getdbpsw(), sep="")
  system(paste("gdal_contour -f PostgreSQL -i 1 -lco OVERWRITE=YES -nln cont -snodata 9999 -a 'temp' ", tifFileLocation, " '", conString, "'", sep=""))
  
  # Copy in final geojson contour table and add info
  query <- (paste("INSERT INTO ", getContourTempTbl(), "(ogc_fid, wkb_geometry, temp) SELECT ogc_fid, wkb_geometry, temp FROM cont;" , sep=""))
  postgresSendQuery(query)
  
  # Update Tabel year month event id column for geojson file
  query <- paste("UPDATE ", getContourTempTbl(), " set event_id = ",  evid, ", year = ", year, ", month = ", month, " WHERE year IS NULL;", sep="")
  postgresSendQuery(query)
  
}

