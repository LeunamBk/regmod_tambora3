# gets temperature data from 3d array to row for every event and loads it in
# chunks to defined table 
stationTemp2Db <- function(con, vdata.raw, schema, table, chunks){
  vdata <- vdata.raw 
  ids <- names(vdata[,1,1])
  yearId <- names(vdata[1,1,])
  monthId <- names(vdata[1,,1])
  data <-data.frame()
  row <- 1
  for(year in 1:dim(vdata)[3]){
    for(month in 1:dim(vdata)[2]){
      for(id in 1:dim(vdata)[1]){
        if(!is.na(vdata[id,month,year])){
          data[row,1] <- as.numeric(ids[id])*1  
          data[row,2] <- as.numeric(yearId[year])*1
          data[row,3] <- month   
          data[row,4] <- vdata[id,month,year]
          row <- row + 1
          if(row == chunks){
            # write data in chunks (default 5000) to db (dont process whole dataset because of memory restriction
            # depending on available ram on machine)
            names(data) <- c("station_id","year","month","temperature")
            dbWriteTable(con, c(schema,table), data, row.names = FALSE, append = TRUE)
            data <-data.frame()
            row <- 1
          }
        }
      }
    }
  }
  # pass rest to db
  names(data) <- c("station_id","year","month","temperature")
  dbWriteTable(con, c(schema,table), data, row.names = FALSE, append = TRUE)
}
