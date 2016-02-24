pull_dataTo_gJson <- function(query_year, query_month){
  
  ## loads the PostgreSQL driver
  drv <- dbDriver("PostgreSQL")

  ## Open a connection
  con <- dbConnect(drv, host = getdbHost(), user= getdbuser(), password=getdbpsw(), dbname=getdbname())
  
  ##debug
  #query_month <- 3
  #query_year <- 1740
  ##
  
  # prepare sql query
  sqlQuery <- paste('SELECT * from temp_monthly Where year_begin = ', query_year, ' and month_id_begin = ', query_month, ';' , sep='') 
  
  # exec query and fetch data
  res <- dbGetQuery(con, sqlQuery) 
  
  ## Closes the connection
  dbDisconnect(con)
  
  ## Frees all the resources on the driver
  dbUnloadDriver(drv)
  
  # get results
  indexdatapoints <- cbind(res$lat, res$lon, res$value_idx)
  
  # Write Data to geojson
  nowDate <- format(Sys.time(), "%H_%M_%S") 
  gjsonOutName <- paste('genmaps/',sample(1:1000, 1),'leafletPointTest',nowDate,sep='')
  # toGeoJSON(res, gjsonOutName, dest='www', lat.lon=c('lat','lon'), overwrite=TRUE)
  
  # round idx data location to .5 grid
  indexdatapoints[,1:2] <- round(indexdatapoints[,1:2]*2)/2
  
  output <- list(paste(gjsonOutName, '.geojson', sep=''), indexdatapoints)
  
  return(output)
}