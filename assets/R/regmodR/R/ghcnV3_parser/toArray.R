.toArray <- function(v3Data){
  #author Nick stokes
  # Steve M, comments, interface, error checking etc
  # added dimnames, renamed vars for clarity
  # added all records missing check
  
   
  # A count of all station records
  stations <- nrow(v3Data)
  start    <- min(v3Data[,2]) - 1
  end      <- max(v3Data[,2])
  
  stationIndex <- c(0, which(diff(v3Data[,1]) != 0), stations)  
  stationCount <- length(stationIndex) - 1 
   
  x            <- array(NA,c(stationCount,12, end - start))
  dimnames(x) <-  list(unique(v3Data[ ,1]),month.abb,min(v3Data[ ,2]):max(v3Data[ ,2]))
   
  for(i in 1:stationCount){  # loop over stations
       
      records <- c(stationIndex[i]+1, stationIndex[i+1]) 
      if (records[1] == records[2]) next
      iy <- as.matrix(v3Data[records[1]:records[2], ])
       
      oy <- (iy[ ,2] > start) & (iy[ ,2] <= end) 
      if(sum(oy) < 2 )next 
      iz <- iy[oy, ]  
      x[i, , iz[ ,2] - start] <- t(iz[ ,3:14]) 
       
  }
  allMissing <- apply(is.na(x), MARGIN = 1, FUN = all)
  if (sum(allMissing > 0)){
    print("Removing station with all data Missing")
    x <- x[!allMissing, , ]    
  } 
  cat("Stations read in ", stationCount, "\n")
  cat("Stations with more than 1 year of data ", dim(x)[1], "\n")
   
return(x)
}