# small handy functions

# define new max with default na.rm
nanmax <- function(x){
  max(x, na.rm=T)
}

# redeclare mean function with default na.rm
nanmean <- function(x){
  mean(x, na.rm=T)
}

# get extent (bounding box) of raster
getRasterExtent <- function(raster){
  return(extent(raster))
}

# count not na values
countN <- function (v) {
  return (Reduce(function (x, y) x + y, ifelse(is.na(v), 0, 1)))
}

# checks if two matrices are identical
matequal <- function(x, y){
  is.matrix(x) && is.matrix(y) && dim(x) == dim(y) && identical(x,y) && (countN(x)==countN(y)) && (mean(x,na.rm=TRUE)==mean(y,na.rm=TRUE)) && (max(x,na.rm=TRUE)==max(y,na.rm=TRUE)) && (min(x,na.rm=TRUE)==min(y,na.rm=TRUE)) 
}

