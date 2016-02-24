# excludes all events wich are not located on the reanalysis raster (and therefore not on landsurface)
# from calculation
removeEventsNotOnCruRaster <- function(maps, latitude, longitude, events, grid){

  x <- ((events[,1]-min(latitude))/grid)+1
  y <- ((events[,2]-min(longitude))/grid)+1
  validEvents <- c()
  for(i in 1:length(x)){
    positionData <- maps[,x[i],y[i]]
    if(sum(is.na(positionData)) != length(positionData)){
      validEvents <- c(validEvents,i)    
    }
  }

  # set entry for in update register table for data which is not recontructable
  if(length(validEvents) != 0){
    for(id in events[-validEvents,4]){
      registerRecontructedEvent(id, FALSE)
    }
  } else {
    for(id in events[,4]){
      registerRecontructedEvent(id, FALSE)
    }
  }

  print(matrix(events[validEvents,],length(validEvents)))
  return(matrix(events[validEvents,],length(validEvents)))
}
