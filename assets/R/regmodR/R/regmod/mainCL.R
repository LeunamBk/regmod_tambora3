# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# main execution file for regmodR to call from command line like:
# mainCL.R 1740 1
#
# date: 10.3.2015
# author: Manuel Beck
# email: manuelbeck@outlook.com
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# kill RD-DBI driver opened db connections if something has crashed 
# library(DBI)
# lapply(dbListConnections(PostgreSQL()), dbDisconnect)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# DEFINE WORKSPACE FROM COMMAND LINE ARGUMENT
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# read in the arguments listed at the command line
args <- (commandArgs(TRUE))
if(length(args)>0){
  wdPATH <- args[[1]]
  setwd(wdPATH)
} 

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# INCLUDE LIBRARYS & FUNCTIONS:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# includes all regmodR functions and all necessary librarys
source(paste(getwd(), '/fullHeader.R', sep=''))

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# CONFIGURATION:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 

# degrees of data wich are selected around the events and taken into account for computionan
padding.lat <- c(-20, 20)
padding.lon <- c(-20, 20)

# regression quality parameter 
regression.quality <- .9

# weight of one index step to temperature
index.weight <- .85

# border of the cummulative sum of variance for the used main component from pca
pca.quality <- .9

# resolution of reanalysis data in degree
grid <- .5

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# MAIN:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 

# args are the command line arguments as list of character vectors
# First check to see if arguments are passed.
if(length(args) == 7 ){
  
  print("RECONSTRUCT FROM ALL AVAILABLE DATA")
  
  # get available months from data
  yearMonthList <- getYearMonthList() 
  
  # cycle throu months and run model
  for(i in 1:nrow(yearMonthList)){
    
    # save year and month to global scope
    year <<- yearMonthList[i,1]
    month <<- yearMonthList[i,2]
    
    print('\n# # # # # # # # # # # # # # # # # # # # # # # # # #\n')
    print(paste(i, year, month))
    print('\n# # # # # # # # # # # # # # # # # # # # # # # # # #\n')
    
    tryCatch({
      runRegmod(padding.lat, padding.lon, index.weight, regression.quality, pca.quality, grid)
    },
             error = function(e){
               print(paste('ERROR', year, month, e)) 
               # kill open db connections in case of error interupt
               library(DBI)
               lapply(dbListConnections(PostgreSQL()), dbDisconnect)
             }) 
  }
  
} else if(length(args) == 9 ){
  
  # for update reconstructed data based on piped year month list
  yearsList <- strsplit(args[[8]],',')[[1]]
  monthsList <- strsplit(args[[9]],',')[[1]]
  
  for(i in 1:length(yearsList)){
    year <<- as.numeric(yearsList[i])
    month <<- as.numeric(monthsList[i])
    
    runRegmod(padding.lat, padding.lon, index.weight, regression.quality, pca.quality, grid)  
  }
  
}else {
  
  # parseCommandArgs()
  # save to global scope
  year <<- as.numeric(args[[2]])
  month <<- as.numeric(args[[3]])
  print(year)
  print(month)
  
  # execute
  execTime <- proc.time()
  runRegmod(padding.lat, padding.lon, index.weight, regression.quality, pca.quality, grid)
  
  # calculate and log execution time
  execTime <- proc.time() - execTime
  print(paste("EXEC TIME: ", execTime['elapsed']))
}

