getIndexData <- function(query_year, query_month){

  # prepare sql query
  sqlQuery <- getIndexDataTamboraQuery(query_year, query_month)

  # get data from db
  res <- postgresGetQuery(sqlQuery)
  
  # aggregate results
  indexdatapoints <- cbind(res$latitude, res$longitude, res$average, res$event_id)
  
  # get sign of value for right addition of underling snap to grid 
  singed <- indexdatapoints[,1:2] < 0
  
  # round idx data location to .25/.75 grid
  indexdatapoints[which(abs(indexdatapoints[,1:2])%%1 >= .5)] <- abs(as.integer(indexdatapoints[which(abs(indexdatapoints[,1:2])%%1 >= .5)])) + 0.75
  indexdatapoints[which(abs(indexdatapoints[,1:2])%%1 <= .5)] <- abs(as.integer(indexdatapoints[which(abs(indexdatapoints[,1:2])%%1 <= .5)])) + 0.25
  
  # correct by sign
  coordinates <- indexdatapoints[,1:2]
  coordinates[singed] <- coordinates[singed] * -1
  indexdatapoints[,1:2] <- coordinates 
  
  # sort values if more than one in asc to ensure right value location assigment
  if(length(indexdatapoints) > 4){
    indexdatapoints <- indexdatapoints[ order(indexdatapoints[,1], indexdatapoints[,2]), ]
  } 
  
  return(indexdatapoints)
}