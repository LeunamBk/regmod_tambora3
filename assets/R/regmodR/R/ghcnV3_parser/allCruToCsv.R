# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Calculates monthly mean and std map from cru data and loads to db
#
# Clear Workspace
#rm(list=ls())
Sys.setlocale(locale="C")
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#
# CONFIGURATION:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# define area wich should read from netcdf file
dim.lon <- c(-179.75, 179.75)
dim.lat <- c(-89.75, 89.75)              

# define area wich should be stored to db
lat_window <- dim.lat
lon_window <- dim.lon

wd <- '/var/www/vhosts/default/htdocs/tambora2/modules/regmod/assets/R/regmodR/R/regmod'

# set workspace path
setwd(wd)

sources <- list()
sources[['temperature_']] <- '/var/www/vhosts/default/htdocs/regmod/regmodPy/CRU/cru_ts3.tmp.nc'
sources[['vapor_']] <- '/var/www/vhosts/default/htdocs/regmod/regmodPy/CRU/cru_ts3.23.1901.2014.vap.dat.nc'
sources[['precipitation_']] <- '/var/www/vhosts/default/htdocs/regmod/regmodPy/CRU/cru_ts3.23.1901.2014.pre.dat.nc'
sources[['cloud-coverage_']] <- '/var/www/vhosts/default/htdocs/regmod/regmodPy/CRU/cru_ts3.23.1901.2014.cld.dat.nc'

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#
# FUNCTIONS AND LIBRARIES:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

library(ncdf)
source(paste(getwd(), '/fullHeader.R', sep=''))

getCruData <- function(month, dim.lon, dim.lat, nc, fileName){
  
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
    
  formatAndWriteToCsv(month, years.available, monthData, longitude, latitude, fileName)
  
}

formatAndWriteToCsv <- function(month, years, monthData, longitude, latitude, fileName){
  
  monthCsv <- array(9999, c((dim(longitude)*dim(latitude)), dim(monthData)[1]+2))
  
  for(k in 1:dim(monthData)[1]){
  
    for(l in 1:dim(longitude)){
    
      monthCsv[l,1] <- longitude[l] 
      
      for(m in 1:dim(latitude)){
        row <- ((l-1)*dim(latitude))+m
        monthCsv[row,k+2] <- monthData[k,l,m] 
        monthCsv[row,2] <- latitude[m]  
      }
    }  
  }
  
  colnames(monthCsv) <- c("lon","lat",seq(1901,1900+years))
  
  filename <- paste(fileName, month,'.csv', sep="")
  write.table(monthCsv, file = filename, sep = ";", dec = ".", row.names = FALSE, col.names = TRUE)
}


for(n in 1:length(sources)){

  nc <- open.ncdf(sources[[n]])
  
  for(i in 1:12){
    # load cru data
    getCruData(i, dim.lon, dim.lat, nc, names(sources[n]))
    print(i)
  }

  # close netcdf file
  close.ncdf(nc)

}