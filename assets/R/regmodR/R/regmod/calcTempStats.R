# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Clear Workspace
rm(list=ls())

Sys.setlocale(locale="C")
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

source(paste(getwd(), '/regmodR/fullHeader.R', sep=''))

calcStats <- function(){
  
  for(month in 1:12){
    # get cru mean month data
    query <- paste('SELECT ST_DUMPVALUES(rast), idx_ymax, idx_ymin, idx_xmax, idx_xmin from crumapsmean100  WHERE month = ', month,' ;' , sep='') 
    cruMat <- getPsqlAsMat(query, 117, 137)
    cruMat <- matrix(cruMat,117,137)
    cruRast <- raster(cruMat)
    
    # get single field
    query <- paste('SELECT ST_DUMPVALUES(rast), idx_ymax, idx_ymin, idx_xmax, idx_xmin , event_id from single_recon_temp_png  WHERE month = ', month,' ;' , sep='') 
    singleMatArr <- getPsqlAsMat(query, 117, 137)
    single.evId.List <- singleMatArr[[2]]
    singleMat.List <- singleMatArr[[1]]
    
    if(length( singleMat.List) > 0){
      for(i in 1:length(single.evId.List)){
        single.evId <- single.evId.List[i]
        singleMat <- matrix(singleMat.List[i,,], 117, 137)
        singleRast <- raster(singleMat)
        
        # calculate temperature difference
        cruRast.masked <- mask(cruRast, singleRast)
        offset <- mean1(values(singleRast)) - mean1(values(cruRast.masked))
        
        print(paste(i,"/",length(single.evId.List) ))
        print(paste('month: ', month))
        print(paste('evid: ', single.evId))
        print(paste('offset: ', offset))
        
        if(!is.na(offset)){
          query <- paste('INSERT INTO ', getdbTempStatsTbl(), '(', getTempStatsEvid(), ', ', getTempStatsCru(), ') ',
                         'VALUES (', single.evId, ', ', offset ,'); ', sep='')
          
          postgresSendQuery(query)
        }
      }
    }
  }
  
}

execTime <- proc.time()
calcStats()
# calculate and log execution time
execTime <- proc.time() - execTime
print(paste("EXEC TIME: ", execTime['elapsed'], 'seconds'))


install.packages()
library("parallel")

cl <- makeCluster(detectCores())
stopCluster(cl)
install.packages('batch')



## BEGIN: test_batch.R
seed <- 1000
parseCommandArgs()
execTime <- proc.time()
for(i in 1:12){
  seed <- rbatch("/var/shiny-server/www/datacollectorv2/regmodR/mainCL.R", seed=seed, year1=1740, month1=i)
}
rbatch.local.run()
execTime <- proc.time() - execTime
print(paste("EXEC TIME: ", execTime['elapsed'], 'seconds'))




/var/shiny-server/www/datacollectorv2/regmodR/mainCL.R

getwd()
However we can go further with something like
seed <- rbatch("test.R", seed, a=c(12,14))


library("parallel")
vignette(package="parallel", topic = "parallel")
