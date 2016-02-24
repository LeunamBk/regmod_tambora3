# writes the id, the checksum and the creation date of reconstructed event to db for later update functionality
registerRecontructedEvent <- function(id, reconstructed = TRUE){
  
  # get hash from view
  hash <- postgresGetQuery(getEventHashTamboraQuery(id))
  
  # register calculated event with hash id and creation date in db
  sqlQuery <- getRegisterQuery(id, hash, reconstructed)
    
  postgresSendQuery(sqlQuery)
}
