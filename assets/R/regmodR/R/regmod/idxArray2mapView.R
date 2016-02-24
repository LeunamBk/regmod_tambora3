# idxArray2mapView <- function(array, longitude_sel, latitude_sel, year, month, event_id, viewType){
#   
#   # TODO: make changing month weeks days seasons possible
#   date <- paste(year, month, sep='')
#   
#   # output Filename 
#   filenamePng <- getIdxTmpFname()  
#   
#   # array to raster
#   rasterArray <- apply(array, 1, function(x){toRaster(x, longitude_sel, latitude_sel)})
#   rasterArray <- lapply(rasterArray, function(x){trim(x, values=c(NA,NaN))})
# 
#    
#   # interpolateRaster 
#   # rasterArray.interpol <- sapply(rasterArray[,1], function(x){interpolateRaster(x, interpolsteps= 0.1)})
#   
#   # get array extent (bbox)
#   rasterArray.extent <- sapply(rasterArray, getRasterExtent)
#   print(dim(rasterArray.extent))
#   print(rasterArray.extent[[1]])
#
#   pngLocationArray <- list()
#   pngFileLocation <- list()
#   
#   # write idx-raster to path
#   for(i in 1:dim(array)[1]){
#     # data path variables
#     pngLocationArray[[i]] <- pngLocation <- paste(getIdxPngPath(), filenamePng, '_', event_id[i], '_', date, '.png', sep='')
#     pngFileLocation[[i]] <- paste(getwd(), getIdxSaveToTifPath(), filenamePng, '_', event_id[i], '_', date, '.tif', sep='')
#     print('WWWWUUUUUUUUUUUUUZ')
#     print(pngFileLocation[[i]])
#       #   writeRaster(rasterArray[i,1], filename = pngFileLocation, format="GTiff", overwrite=TRUE)
#     plot(pngLocationArray[[i]])
#   }
#   print('kkkkkkkkk')
#   print(xmin(rasterArray.extent[[1]]))
#   # write idx-Data to db
#   writeIdxFieldViewToDB(event_id, year, month, 'idx', pngLocationArray, rasterArray.extent, array)
#  # writeIdxFieldViewToDB <- function(event_id, year, month, viewType= 'idx', locationPng, extent, idxArray){
#   return(list(pngLocationArray, pngFileLocation, rasterArray.extent))
# }
# 
# 















idxArray2mapView <- function(array, longitude_sel, latitude_sel, year, month, event_id, idx_val, viewType){
  
  array1 <<- array
  longitude_sel1 <<- longitude_sel
  latitude_sel1 <<- latitude_sel
  year1 <<- year
  month1 <<- month
  event_id1 <<- event_id
  viewType1 <<- viewType
  # stop()
  # TODO: make changing month weeks days seasons possible
  date <- paste(year, month, sep='')
  
  # output Filename 
  filenamePng <- getIdxTmpFname()  
  
  # array to raster
  rasterArray <- apply(array, 1, function(x){toRaster(x, longitude_sel, latitude_sel)})
  
  # trim NA and NaN values from raster 
  #  rasterArray <<- lapply(rasterArray, function(x){trim(x, values=c(NA, NaN))})
  
  # get array extent (bbox)
  rasterArray.extent <- sapply(rasterArray, getRasterExtent)
  pngLocationArray <- list()
  pngFileLocation <- list()
  
  # loads the PostgreSQL driver
  drv <- dbDriver("PostgreSQL")
  
  # Open a connection
  con <- dbConnect(drv, host = getdbHost(), user= getdbuser(), password=getdbpsw(), dbname=getdbname())
  # write idx-raster to path
  for(i in 1:dim(array)[1]){
    # data path variables
    pngLocationArray[[i]] <- pngLocation <- paste(getIdxPngPath(), filenamePng, '_', event_id[i], '_', date, '.png', sep='')
    pngFileLocation[[i]] <- paste(getwd(), getIdxSaveToTifPath(), filenamePng, '_', event_id[i], '_', date, '.tif', sep='')
    #writeRaster(rasterArray[[i]], filename = pngFileLocation[[i]], format="GTiff", overwrite=TRUE)
    # write raster to db
    system(paste('raster2pgsql -e -Y -F -C -s 3857 -a ', pngFileLocation[[i]],' public.', getdbIdxTbl1(),' | psql -d postgres -U postgres',sep=''))
    # set sql Query for updating aditional columns
    sqlQuery <- paste('UPDATE ', getdbIdxTbl1(),' SET year = ', year,', month = ', month,', event_id = ', event_id[i],', idx_val = ', idx_val[i], ', idx_xmin = ', xmin(rasterArray.extent[[i]]),' ,idx_xmax = ', xmax(rasterArray.extent[[i]]), ', idx_ymin = ', ymin(rasterArray.extent[[i]]), ', idx_ymax = ',ymax(rasterArray.extent[[i]]), ' WHERE event_id IS NULL;', sep='') 
    # exec query and fetch data
    dbSendQuery(con, sqlQuery)
  }
  
  # Closes the connection
  dbDisconnect(con)
  
  # Frees all the resources on the driver
  dbUnloadDriver(drv)
  
  return(list(tifFileLocationArray, pngLocationArray, rasterArray.extent))
  
}
