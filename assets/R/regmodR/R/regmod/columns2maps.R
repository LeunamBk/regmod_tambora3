columns2maps <- function(incolumns, anzlon, tip = F){
  # anzlon: count lon
  # incolumns: jede zeile eine karte
  
  if (floor(ncol(incolumns)/anzlon) == ncol(incolumns)/anzlon){
    anzlat <- ncol(incolumns)/anzlon
    corelmap <-  array(0,c(nrow(incolumns), ncol(incolumns)/anzlon, anzlon))
    for(i in 1:anzlat){
      corelmap[,i,] <- incolumns[,seq((i-1)*anzlon+1 , i*anzlon)]
    }
  } else {
    stop("ERROR: incolumns(); Wrong number of grid fields in LON")
  }
  
  return(corelmap)   
}

columns2maps1 <- function(korrels, longitude){
  # anzlon: count lon
  # incolumns: jede zeile eine karte
  ee <- apply(array(c(korrels), dim = c(nrow(korrels), length(longitude), ncol(korrels)/length(longitude))), c(3,2), t)
  return(ee)   
}

