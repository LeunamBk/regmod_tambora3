postgresSendQuery <- function(query){
  
  # loads the PostgreSQL driver
  drv <- dbDriver("PostgreSQL")
  
  ## Open a connection
  # con <- dbConnect(drv, host = getdbHost(), port = getdbport(), user= getdbuser(), password=getdbpsw(), dbname=getdbname())
  con <- dbConnect(drv, port = getdbport(), user= getdbuser(), password=getdbpsw(), dbname=getdbname())
  
  # exec query
  dbSendQuery(con, query) 
  
  ## Closes the connection
  dbDisconnect(con)
  
  ## Frees all the resources on the driver
  dbUnloadDriver(drv)
}

postgresGetQuery <- function(query){
  
  # loads the PostgreSQL driver
  drv <- dbDriver("PostgreSQL")
  
  ## Open a connection
  # con <- dbConnect(drv, host = getdbHost(), port = getdbport(), user= getdbuser(), password=getdbpsw(), dbname=getdbname())
  con <- dbConnect(drv, port = getdbport(), user= getdbuser(), password=getdbpsw(), dbname=getdbname())
  
  # exec query and fetch data
  res <- dbGetQuery(con, query) 
  
  ## Closes the connection
  dbDisconnect(con)
  
  ## Frees all the resources on the driver
  dbUnloadDriver(drv)
  
  return(res)
}

getPsqlAsMat <- function(sqlQuery, x = FALSE, y = FALSE){
  
  # set sql Query
  #sqlQuery <- paste('SELECT ST_DUMPVALUES(rast), idx_ymax, idx_ymin, idx_xmax, idx_xmin from single_recon_temp_png  WHERE month = ', 10,' ;' , sep='') 
  
  # exec query and fetch data
  queryRes <- postgresGetQuery(sqlQuery)
  
  if(length(queryRes) > 0){
  
    #-#-#-#-#-#-#-#-##-##-#-##-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
    # queryRes <- queryRes[,1]
    # names(queryRes)
    # 
    if(x == FALSE && y == FALSE){
      x <- (((queryRes$idx_ymax-queryRes$idx_ymin)*2)+1)
      y <- (((queryRes$idx_xmax-queryRes$idx_xmin)*2)+1)
      
      if(length(x)>1 && length(y)>1){
        x <- x[1]
        y <- y[1]
      }
    }else{
      x <- x
      y <- y
    } 
    
    # unescape bytea from postgres NOTICE: FORCE DB TO OUTPUT with escape
    # ALTER DATABASE postgres SET bytea_output = 'escape'; 
    resultMat <- array(0, c(nrow(queryRes), x, y))
    for(j in 1:nrow(queryRes)){
      # new format (since postgres 9.x is hex escaped which is diffrent to encode)
      res <- substr(queryRes[j,1], 5, nchar(queryRes[j,1])-2)
      
      # strip matrix wrapper brackets
      res.tmp <- regmatches(queryRes[j,1], gregexpr("(?<=\\{)[^]]+(?=\\})", queryRes[j,1], perl=T))[[1]]
      # get rows
      res.lines <- regmatches(res.tmp, gregexpr("\\{(.*?)\\}", res.tmp, perl=T))[[1]]
      res.tmp <- matrix(NA, length(res.lines), 1)
      for( i in 1:length(res.lines)){
        res.tmp[i,] <- regmatches(res.lines[i], gregexpr("(?<=\\{)[^]]+(?=\\})", res.lines[i], perl=T))[[1]]
        colCount <- length(unlist(strsplit(res.tmp[i,], ",")))
      }
      # write to matrix; Warning as intended NULL to NA conversion
      resmat <- matrix(as.numeric(unlist(strsplit(res.tmp, ","))),length(res.lines),colCount, byrow=TRUE)
      # handle NA values
      resmat[resmat == -1.7000e+308] <- NA  
      resultMat[j,,] <- apply(t(resmat),1,rev) 
      dim(apply(t(resmat),1,rev))
      #resultMat[j,,] <- matrix(as.numeric(unlist(strsplit(res.tmp, ","))),length(res.lines),colCount, byrow=TRUE)
      
    }
    
    # return event_id too if in select
    if("event_id" %in% names(queryRes)){
      return(list(resultMat, queryRes$event_id))
    } else {
      return(resultMat)  
    }
  
  }
}