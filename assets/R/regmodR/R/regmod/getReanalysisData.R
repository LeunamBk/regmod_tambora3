# get reanalysis data for central europe from RData file
getReanalysisData <- function(month){
  
  # create path to CRU folder
  cruPATH <- gsub("R/regmod", "", getwd())
    
  # build connection path
  con <- paste(cruPATH, 'regmodR/CRU/', 'cru_temp_europe_', month, '.RData', sep='')
  
  # load time, longitude, latitude and maps
  load(con) 
  
  return(list(time, longitude, latitude, maps))  
}


# get reanalysis data for the whole world netCDF file
getCruData <- function(month, lon.sel, lat.sel){

  library(ncdf)
  
  # open file 
  # nc <- open.ncdf("C:/CStuff/cru_ts3.23.1901.2014.tmp.dat.nc")
  nc <- open.ncdf(getReanalysisFileNc())
  
  # check if requested region coordinates fit in world file 
  ## TODO: take data fields at latitudinal borders into account (relevant for events in ~alaska)
  lon.source <- c(min(nc$dim[[1]]$val), max(nc$dim[[1]]$val))
  lat.source <- c(min(nc$dim[[2]]$val), max(nc$dim[[2]]$val))
  extent <- setToAvailableExtent(lon.sel, lat.sel, lon.source, lat.source)
  dim.lat <- extent[[1]]
  dim.lon <- extent[[2]]
  
  # apply appropriate resolution to selection extent (by first nearest match)
  dim.lon <- nc$dim[[1]]$val[findInterval(dim.lon, nc$dim[[1]]$val)]
  dim.lat <- nc$dim[[2]]$val[findInterval(dim.lat, nc$dim[[2]]$val)]
  
  # map lat lon data to file cru ncdf indexing schema
  lon.start <- which(nc$dim[[1]]$val == dim.lon[1])
  lon.end <- which(nc$dim[[1]]$val == dim.lon[2])
  
  lat.start <- which(nc$dim[[2]]$val == dim.lat[1])
  lat.end <- which(nc$dim[[2]]$val == dim.lat[2])
  
  # prepare selecting vector
  dim.start <- c(lon.start, lat.start, month)
  # NOTE: netCDF package implementation differs from R logic eg: in R the selection 
  # a[1:3] of the vector c(1,2,3,4,5) returns <- 1 2 3 netcdf (and python) return 1 2 
  # R -> a[a>=from && a<=to]; netcdf and python -> a[a>=from && a<to] !!! 
  # buuuut; this is intendet to maintain the resolution of .5deg;
  # buuuuuuuuuut; I dont want to throw data away, therefore longitude and 
  # latitude vectors are extended by one .5 step
  dim.end <- c((lon.end-lon.start)+1, (lat.end-lat.start)+1, 1)
  
  # get number of available years for every month
  years.available <- nc$var[[1]]$varsize[3] / 12
  
  # get vector of lat lon data
  longitude <- nc$dim[[1]]$val[lon.start:lon.end] 
  latitude <- nc$dim[[2]]$val[lat.start:lat.end] 
  
  # predefine month array like 100 81 161
  monthData <- array(NA, c(years.available, dim(longitude), dim(latitude)))
  
  for(j in 1:years.available){
    # read data from file for given month
    monthData[j,,] <- get.var.ncdf(nc, start=dim.start, count=dim.end)
    # set time for next month
    dim.start[3] <- dim.start[3] + 12
  }
  
  # append one step to maintain .5 deg resolution
  #longitude <- c(longitude, longitude[length(longitude)]+.5)
  #latitude <- c(latitude, latitude[length(latitude)]+.5)
  
  # close netcdf file
  close.ncdf(nc)
  
  # change dimensions for consistency with codebase 
  monthData <- aperm(monthData, c(1,3,2))
  
  return(list(monthData, longitude, latitude))
}