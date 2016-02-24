getR2PSQLPath <- function(){
  # returns path to raster2psql; this depends on used postgis version
  path <- '/usr/bin/'
  #path <- ''
}

# define temporary tif file path (for postgres cru data import)
getTmpTifPath <- function(){
   # path <- '/genMaps/tif/'
   path <- args[[6]]
}

# define temporary tif file
getTmpTifFile <- function(){
   path <- paste(args[[6]],'/tmp.tif',sep="")
}

# path for the reanalysis world file data
getReanalysisFileNc <- function(){
  path <- args[[7]]
}
