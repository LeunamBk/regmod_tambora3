writeViewToDB <- function(year, month, viewType, locationTif, event_id = NULL, idx_val = NULL, evCount = NULL){
  
  if(viewType == 'recon'){
    # writes reconstructed datasset for whole month to db
    
    system(paste(getR2PSQLPath(), 'raster2pgsql -s 4326 -N 9999 -a ', locationTif, ' ', getdbMonthlyTempTbl(),' | psql -d ', getdbname(),' -U ', getdbuser(),' -p ', getdbport(), sep=''))
    
    sqlQuery <- paste('UPDATE ', getdbMonthlyTempTbl(),' SET year = ', year,', month = ', month,', event_count = ', evCount,' WHERE year IS NULL;', sep='') 
    
  } else if(viewType == 'single'){
    # writes single indexfield (idependent from other indexfields of month) to db  
    
    # write file to raster column in db
    system(paste(getR2PSQLPath(), 'raster2pgsql -s 4326 -N 9999 -a ', locationTif, ' ', getdbSingleTempTbl(),' | psql -d ', getdbname(),' -U ', getdbuser(),' -p ', getdbport(), sep=''))
    
    # set sql Query for updating aditional columns
    sqlQuery <- paste('UPDATE ', getdbSingleTempTbl(),' SET event_id = ', event_id,' WHERE event_id IS NULL;', sep='') 
    
    # add event with md5 and creation date to update lookup table
    registerRecontructedEvent(event_id)
    
  } else if(viewType == 'weightPca'){
    # writes single regression values map for indexpoint (idependent from other indexfields of month) to db  
    
    system(paste(getR2PSQLPath(), 'raster2pgsql -s 4326 -N 9999 -a ', locationTif, ' ', getdbWeightPcaTbl(),' | psql -d ', getdbname(),' -U ', getdbuser(),' -p ', getdbport(), sep=''))
    
    # set sql Query for updating aditional columns
    sqlQuery <- paste('UPDATE ', getdbWeightPcaTbl(), ' SET event_id = ', event_id,' WHERE event_id IS NULL;', sep='') 
    
  } else if(viewType == 'idxRecPca'){
    # write idx distribution matrix for single idx field to postgres
    
    system(paste(getR2PSQLPath(), 'raster2pgsql -s 4326 -N 9999 -a ', locationTif, ' ', getdbIdxRecPcaTbl(),' | psql -d ', getdbname(),' -U ', getdbuser(),' -p ', getdbport(), sep=''))
    # set sql Query for updating aditional columns
    sqlQuery <- paste('UPDATE ', getdbIdxRecPcaTbl(),' SET event_id = ', event_id,' WHERE event_id IS NULL;', sep='') 

  } else {
    
  }
  
  # exec query
  postgresSendQuery(sqlQuery)
  
}