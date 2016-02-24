# database connection parameters
# Be awere of that any changed table name here must also be changed in the PHP scripts!

# online
getdbHost <- function(){
  host <- 'localhost'
}

getdbuser <- function(){
  user <- args[[4]]
}

getdbpsw <- function(){
   password <- args[[5]]
}

getdbname <- function(){
   dbname <- args[[2]]
 }
 
getdbport <- function(){
   dbport <- args[[3]]
}

getTamboraView <- function(){
  tamboraView <- "events_timespace"
}

getMonthlyTemperatureTamboraSubselectQuery <- function(){
  subselect <- " WHERE node_id = 237 AND 
                duration_days >=28 AND 
                duration_days <= 31 AND
                NOT location_id IN (5095, 5141) AND
                average IS NOT NULL AND
                project_id NOT IN (SELECT id FROM grouping.project WHERE acronym IN ('goethe', 'WK2', 'WeikImp1')) "
}

# database table and columns for storing model data

getdbMonthlyTempTbl <- function(){
  dbIdxTbl <- 'regmod.temperature_monthly_recon'
}

getContourTempTbl <- function(){
  geojsonTempTbl <- 'regmod.teperature_monthly_isotherms'
}

getdbSingleTempTbl <- function(){
  dbIdxTbl <- 'regmod.temperature_monthly_recon_single'
}

getdbWeightPcaTbl <- function(){
  dbWeightPcaTbl <- 'regmod.temperature_monthly_regio_weight'
}

getdbIdxRecPcaTbl <- function(){
  dbIdxRecPcaTbl <- 'regmod.temperature_monthly_regio_idxrec'
}

getdbCruMeanTbl <- function(){
  cruMeanTbl <- 'regmod.temperature_cru_mean'
}

getdbCruStdTbl <- function(){
  cruStdTbl <- 'regmod.temperature_cru_std'
}

# Temperature stats table
getdbTempStatsTbl <- function(){
  user <- "temperatureStats"
}

# table for calculated events with hash for update on data change functionality
getdbUpdateRegTbl <- function(){
  updateTbl <- 'regmod.temperature_monthly_events_update_register'
}

getTempStatsEvid <- function(){
  col <- "event_id"
}

getTempStatsCru <- function(){
  col <- "cru_diff_mean"
}

getYearMonthListTamboraQuery <- function(){
  query <- paste("SELECT DISTINCT year, month 
            FROM ", getTamboraView(),
                    getMonthlyTemperatureTamboraSubselectQuery(),
                    "ORDER BY year, month;", sep="")
}

getIndexDataTamboraQuery <- function(query_year, query_month){
  query <- paste("SELECT event_id, longitude, latitude, average
                    FROM ", getTamboraView(), 
                      getMonthlyTemperatureTamboraSubselectQuery(), " AND 
                      year = ", query_year, " AND 
                      month = ", query_month, ";", sep="") 
}

getEventHashTamboraQuery <- function(event.id){
  query <- paste("SELECT checksum
                    FROM ", getTamboraView(), 
                    " WHERE event_id = ",event.id, ";", sep="") 
}

getRegisterQuery <- function(id, hash, reconstructed){
  query <- paste("INSERT INTO ", getdbUpdateRegTbl(), 
                    " (event_id, checksum, created, reconstructed) 
                    VALUES (", id, ", '",hash, "', '", Sys.Date(), "' , ", reconstructed, ");", sep="")  
}
