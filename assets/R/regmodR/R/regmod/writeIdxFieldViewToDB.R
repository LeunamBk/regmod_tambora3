writeIdxFieldViewToDB <- function(event_id, year, month, viewType= 'idx', locationPng, extent, idxArray){

  # get Na and NAN values to postgres datat format NULL
  idxArray[which(is.nan(idxArray))] <- 99999
  idxArray[which(is.na(idxArray))] <- 99999
  
sqlQueryHead <- paste('INSERT INTO ', getdbIdxTbl(), '(', getdbidxEventId(), ', ', getdbIdxYearCol(), ', ', getdbIdxMonthCol(), ', ', getdbidxPngCol(), ', ', getdbidxPngColXmin(), ', ', getdbidxPngColXmax(), ', ', getdbidxPngColYmin(), ', ', getdbidxPngColYmax(), ', ', getdbidxArrayCol(),') VALUES ', sep='')
  
  print(dim(idxArray))
  for(i in 1:length(event_id)){
    numrows <- dim(idxArray[i,,])[1]
     for(j in 1:numrows){
       rowVals <- paste('{', paste(idxArray[i,j,], collapse=","), '}', sep='')
       if(j==1){
         idxData <- rowVals
         }else{
         idxData <- paste(idxData, rowVals, sep=',') 
       }
     }
     idxData <- paste("'{", idxData, "}'", sep='')
     insertStr <- paste('(', event_id[i], ', ', year, ', ', month, ', ', "'", locationPng[[i]], "'", ', ', xmin(extent[[i]]), ', ', xmax(extent[[i]]), ', ', ymin(extent[[i]]), ', ', ymax(extent[[i]]), ', ', idxData,')', sep='')
     if(i==1){
       sqlQueryVals <- insertStr
       }else{
       sqlQueryVals <- paste(sqlQueryVals, insertStr, sep=', ')
     }
  }
  sqlQuery <- paste(sqlQueryHead, sqlQueryVals, ';', sep=' ')

  ## loads the PostgreSQL driver
  drv <- dbDriver("PostgreSQL")
  
  ## Open a connection
  con <- dbConnect(drv, host = getdbHost(), user= getdbuser(), password=getdbpsw(), dbname=getdbname())
  
  # exec query and fetch data
  res <- dbSendQuery(con, sqlQuery) 
  
  ## Closes the connection
  dbDisconnect(con)
  
  ## Frees all the resources on the driver
  dbUnloadDriver(drv)

 }