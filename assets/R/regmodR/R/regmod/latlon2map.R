latlon2map <- function(latlondata, lat, lon, method = 'mean'){
  
  # # # # # 
  # for testing purpose
  #latlon2map(indexwerte,latitude_sel, longitude_sel)
  
#  latlondata <- indexdata
#  lat <- latitude_sel 
#  lon <- longitude_sel
#  method = 'maen'
  # # # # # # # 
  
  # create empty map matrix with appropiate dimensions
  map = matrix(NaN,length(lat),length(lon))
  
  # find position of data point ## NOTICE ONLY .5 Values Possoble by current configuration
  # pleasr substitude with vector operation (simple approach doesnt work=> writes all values in column; bug?)
  for(i in 1:nrow(latlondata)){
    ort_lat <- which(lat %in% latlondata[i,1])
    ort_lon <- which(lon %in% latlondata[i,2])
    
    if (length(ort_lat) == 0 || length(ort_lon) == 0) {
      print('latlon2map not all locations were found in ref system please check Indexpoints location an steps of lat lon raster')
    } else {
      map[ort_lat, ort_lon] <- latlondata[i,3]  
    }   
    
    
  }
  
  return(map)
  
  # BUGGY PLEASE REWORK
  #  # For Testing checks dimension of latlondata input (iteration in regionalisieren:testen => keine Matrix!!!)  
  #if (class(latlondata) == 'numeric'){
  #    switch(method,
  #           mean = map[ort_lat[1], ort_lon[1]] <- mean(latlondata[3]),
  #           sum =  map[ort_lat[1], ort_lon[1]] <- sum(latlondata[3])
  #    )
  #    return(map)
  #    
  #  } else if (class(latlondata) == 'matrix'){
  #    switch(method,
  #           mean = map[ort_lat, ort_lon] <- mean(latlondata[,3]),
  #           sum =  map[ort_lat, ort_lon] <- sum(latlondata[,3])
  #           
  #           dim(map)
  #    )
  #    return(map)
  #    
  #  } else {
  #    stop("ERROR in latlon2map latlondata format!")  
  #  }
  
}
