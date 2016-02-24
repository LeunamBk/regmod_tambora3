# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # Reset DB Connections
library(DBI)
lapply(dbListConnections(PostgreSQL()), dbDisconnect)

Sys.setlocale(locale="C")
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

source(paste(getwd(), '/regmodR/fullHeader.R', sep=''))

pgRast2RArray <- function(table, month , year){
  # parser for postgis raster data to R
  # readOGR isnt used beacaus of lacking implementation of proper table querying
  # depends to much on gdal version and os used
  
  # set sql Query
  query <- paste("SELECT ST_DUMPVALUES(rast) as raster, (ST_METADATA(rast)).*, ST_BandNoDataValue(rast) as naval FROM ", table," WHERE year = ", year," AND month = ", month," ;" , sep='')
 # query <- paste("SELECT ST_DUMPVALUES(rast) as raster, (ST_METADATA(rast)).*, ST_BandNoDataValue(rast) as naval FROM temperature_live_pca WHERE event_id_hash = 9530;" , sep='')

  # exec query and fetch data
  queryRes <- postgresGetQuery(query)
  
  # manage result data
  raster <- queryRes$raster
  scaleX <- queryRes$scalex
  scaleY <- queryRes$scaley
  numColumns <- queryRes$width
  numRows <- queryRes$height
  naVal <- queryRes$naval 
  xmin <- queryRes$upperleftx
  ymax <- queryRes$upperlefty
  
  # calculate missing bbox coords 
  xmax <- xmin + (scaleX * numColumns)
  ymin <- ymax + (scaleY * numRows)
  
  # calculate biggest bbox coords to fit all data in
  bbox.xmin <- min(xmin)
  bbox.ymin <- min(ymin)
  bbox.xmax <- max(xmax)
  bbox.ymax <- max(ymax)
  
  # calculate bounding box x and y extend (scale has to be the same => postgis raster alignment!)
  bbox.extendX <- abs((bbox.xmin - bbox.xmax) / abs(scaleX[1]))
  bbox.extendY <- abs((bbox.ymin - bbox.ymax) / abs(scaleY[1]))
  
  # calculate top left corner coords for every raster in new bbox array
  raster.xmin <- abs((xmin + (bbox.xmin*-1)) / abs(scaleX[1]))
  raster.xmin[raster.xmin==0] <- 1
  raster.ymax <- abs((ymax + (bbox.ymax*-1)) / abs(scaleY[1]))
  raster.ymax[raster.ymax==0] <- 1
 
  # calculate longitude and latidude vector
  lon <- seq(min(xmin),max(xmax),by=abs(scaleX[1]))
  lat <- seq(min(ymin),max(ymax),by=abs(scaleY[1]))
  
  # prepare global result array
  resultArr <- array(NA, c(length(raster), bbox.extendY, bbox.extendX))

  # parse postgis raster data
  for(j in 1:length(raster)){
    # unescape bytea from postgres NOTICE: FORCE DB TO OUTPUT with escape
    # ALTER DATABASE postgres SET bytea_output = 'escape'; 
    # new format (since postgres 9.x is hex escaped which is diffrent to encode)
    res <- substr(raster[j], 5, nchar(raster[j])-2)
    
    # strip matrix wrapper brackets
    res.tmp <- regmatches(raster[j], gregexpr("(?<=\\{)[^]]+(?=\\})", raster[j], perl=T))[[1]]
    # get rows
    res.lines <- regmatches(res.tmp, gregexpr("\\{(.*?)\\}", res.tmp, perl=T))[[1]]
    res.tmp <- matrix(NA, length(res.lines), 1)
    for( i in 1:length(res.lines)){
      res.tmp[i,] <- regmatches(res.lines[i], gregexpr("(?<=\\{)[^]]+(?=\\})", res.lines[i], perl=T))[[1]]
      colCount <- length(unlist(strsplit(res.tmp[i,], ",")))
    }
    
    # write to matrix; Warning as intended NULL to NA conversion
    resmat <- matrix(as.numeric(unlist(strsplit(res.tmp, ","))),length(res.lines),colCount, byrow=TRUE)
    
    # calculate positioning sequenze for global raster
    raster.xseq <-  seq(from = raster.xmin[j], length.out =ncol(resmat)) 
    raster.yseq <-  seq(from = raster.ymax[j], length.out =nrow(resmat)) 

    # prepare global raster 
    resmat.global <- matrix(NA, bbox.extendY, bbox.extendX)
    
    # eg. a[1:5,1:5] sometimes has not 5*5 = 25 fileds...???
#    if(length( resmat.global[raster.yseq, raster.xseq])!=length(resmat)){
#      raster.yseq <-  seq(from = raster.ymax[j], length.out =nrow(resmat)+1) 
#      print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
#    }
    
    # position raster in global raster
    resmat.global[raster.yseq, raster.xseq] <- resmat

    # flip raster data
    resmat.global <- apply(t(resmat.global),1,rev)
  
    # store global raster in global array
    resultArr[j,,] <- resmat.global
    
  }
  
  return(list(resultArr,lat,lon))
}



table<-"temperature_recon_weight_4_pca"
table<-"temperature_monthly_recon"
month = 1
year = 1767

# get raster data array
pgres <- pgRast2RArray(table, month , year)
raster.array <- pgres[[1]]
lat <- pgres[[2]]
lon <- pgres[[3]]

Rraster.array <- raster.array
mraster.array <- raster.array



dim(Rraster.array)
dim(mraster.array)

trim(mraster.array, NA)

summary(Rraster.array)
summary(mraster.array)
mraster.array[is.na(mraster.array)]<- 9999 

mraster <- toRaster(matrix(mraster.array,81,161) , lon, lat)
dim(mraster.array)
mnraster <- trim(mraster, 9999)
bb <- matrix(mraster.array,81,161)
dim(bb)
# mean all raster data
raster.mean <- apply(raster.array, c(2,3), nanmean)

# to raster object
raster <- toRaster(raster.mean , lon, lat)

# draw raster
debug_plotMapsLocal(raster)

weightMeanRast 
reconMeanRast

#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#

# get some text stats
query <- "SELECT month, (ST_SUMMARYSTATS(rast)).* FROM crumapsmean100;"
pgtable <- postgresGetQuery(query)

query <- "SELECT month, (ST_SUMMARYSTATS(rast)).* FROM crumapsstd100;"
pgtable.std <- postgresGetQuery(query)


# subselect data
plot.data <- pgtable[,4:7]
plot.data[,2] <- pgtable.std[,4]

# Create Line Chart

# get the range for the x and y axis 
xrange <- range(1:12) 
yrange <- range(plot.data) 

# set up the plot 
plot(xrange, yrange, type="n", xlab="month",
     ylab="temperature (C??)" ) 
linetype <- c(1:ncol(plot.data)) 
plotchar <- seq(18,18+ncol(plot.data),1)

# add lines 
for (i in 1:ncol(plot.data)) { 
  tree <- plot.data[,i] 
  lines(1:12, tree, type="b", lwd=1.5,
        lty=linetype[i], col="black", pch=plotchar[i]) 
} 

# add a legend 
legend(xrange[1], yrange[2], names(plot.data), cex=0.8, col="black",
       pch=plotchar, lty=linetype)




#-#-#-#-#-#-#--#-#-##-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#--

# get some text stats
query <- "SELECT BB.month, count(BB.temperature) FROM temperature_validation_stations AS AA INNER JOIN temperature_validation_data_adj AS BB ON AA.station_id = BB.Station_id WHERE AA.lat >= 30 AND AA.lat <= 70 AND AA.lon >= -30 and AA.lon <= 50 Group By BB.month Order by BB.month;"
pg.months <- postgresGetQuery(query)

query <- "SELECT BB.month, avg(BB.temperature),min(BB.temperature),max(BB.temperature),stddev(BB.temperature)  FROM temperature_validation_stations AS AA INNER JOIN temperature_validation_data_adj AS BB ON AA.station_id = BB.Station_id WHERE AA.lat >= 30 AND AA.lat <= 70 AND AA.lon >= -30 and AA.lon <= 50 Group By BB.month Order by BB.month;"
pg.monthsStats <- postgresGetQuery(query)

query <- "SELECT BB.year, count(BB.temperature)  FROM temperature_validation_stations AS AA INNER JOIN temperature_validation_data_adj AS BB ON AA.station_id = BB.Station_id WHERE AA.lat >= 30 AND AA.lat <= 70 AND AA.lon >= -30 and AA.lon <= 50 Group By BB.year Order by BB.year;"
pg.years <- postgresGetQuery(query)

query <- "SELECT BB.year, BB.month, count(BB.temperature)  FROM temperature_validation_stations AS AA INNER JOIN temperature_validation_data_adj AS BB ON AA.station_id = BB.Station_id WHERE AA.lat >= 30 AND AA.lat <= 70 AND AA.lon >= -30 and AA.lon <= 50 Group By BB.year, BB.month Order by BB.year, BB.month;"
pg.monthyear <- postgresGetQuery(query)



# month data
mondata <- as.matrix(t(pg.months[,2]))
colnames(mondata) <- c('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec') 
barplot(mondata,xlab="month", ylab="count",ylim=c(0,12000),cex.lab=1.5) 

# year data
yeardata <- as.matrix(t(pg.years[,2]))
colnames(yeardata) <- pg.years[,1]
barplot(yeardata,xlab="year", ylab="count",ylim=c(0,3000),cex.lab=1.5) 

# month year
year.min <- min(pg.monthyear[,1])
year.max <- max(pg.monthyear[,1])

timeMat <- matrix(0,(year.max-year.min)+1,13)
timeMat[,1] <- year.min:year.max

for(i in 1:nrow(pg.monthyear)){
  year <- pg.monthyear[i,1]
  month <- pg.monthyear[i,2]
  value <- pg.monthyear[i,3]
  row <- which(timeMat[,1]== year)
  timeMat[row,month+1] <- 1 
}

resMat <- matrix(0,nrow(timeMat),2)
for(i in 1:nrow(timeMat)){
  resMat[i,1] <- timeMat[i,1]
  resMat[i,2] <- sum(timeMat[i,2:13])
}
rownames(resMat) <- timeMat[,1]
barplot(resMat[,2],xlab="year", ylab="months available",ylim=c(0,12),cex.lab=1.5) 


which(resMat[,2] != 12)
# month stats
pg.monthsStats

# subselect data
plot.data <- pg.monthsStats[,2:5]

# Create Line Chart
# get the range for the x and y axis 
xrange <- range(1:12) 
yrange <- range(plot.data) 

# set up the plot 
plot(xrange, yrange, type="n", xlab="month",
     ylab="temperature (C??)" ) 
linetype <- c(1:ncol(plot.data)) 
plotchar <- seq(18,18+ncol(plot.data),1)

months <- c('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec')

# add lines 
for (i in 1:ncol(plot.data)) { 
  tree <- plot.data[,i] 
  lines(1:12, tree, type="b", lwd=1.5,
        lty=linetype[i], col="black", pch=plotchar[i]) 
} 

# add a legend 
legend(xrange[1], yrange[2], names(plot.data), cex=0.8, col="black",
       pch=plotchar, lty=linetype)

pg.years[which(pg.years[,2] == max(pg.years[,2])),]
head(yeardata)

layout(matrix(c(1,2,3,4), 2, 2, byrow = TRUE))

barplot(yeardata,xlab="year", ylab="count",ylim=c(0,3000),cex.lab=1.5) 
barplot(resMat[,2],xlab="year", ylab="months available",ylim=c(0,12),cex.lab=1.5) 
barplot(mondata,xlab="month", ylab="count",ylim=c(0,12000),cex.lab=1.5) 
mean(mondata)
# set up the plot 
plot(xrange, yrange, type="n", xlab="month",
     ylab="temperature (C??)", cex.lab=1.5) 
linetype <- c(1:ncol(plot.data)) 
plotchar <- seq(18,18+ncol(plot.data),1)

months <- c('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec')

# add lines 
for (i in 1:ncol(plot.data)) { 
  tree <- plot.data[,i] 
  lines(1:12, tree, type="b", lwd=1.5,
        lty=linetype[i], col="black", pch=plotchar[i]) 
} 

# add a legend 
legend(xrange[1], yrange[2], names(plot.data), cex=0.8, col="black",
       pch=plotchar, lty=linetype)

