 


.cleanInvNames    <- function(names){
# clean gchn names. Inventory specific name cleaning
   
  names <- gsub("  UK ","",names,fixed=TRUE)
	names <- gsub("  USSR ","",names,fixed=TRUE)
	names <- gsub(" SPAIN ","",names,fixed=TRUE)
	names <- gsub("  EGYPT ","",names,fixed=TRUE)
	names <- gsub("  CHINA ","",names,fixed=TRUE)
	names <- gsub("TUNISIA ","",names,fixed=TRUE)
	names <- gsub("UKRAINE FORMER","",names,fixed=TRUE)
	names <- gsub(" TURKEY","",names,fixed=TRUE)
	names <- gsub("SWEDEN","",names,fixed=TRUE)
	names <- gsub("SWITZERLAN","",names,fixed=TRUE)
	names <- gsub("SWITZERLA","",names,fixed=TRUE)
	names <- gsub(" CZECH ","",names,fixed=TRUE)
	names <- gsub(" RUMANIA ","",names,fixed=TRUE)
	names <- gsub(" ROMANIA ","",names,fixed=TRUE)
	names <- gsub(" PORTUGAL ","",names,fixed=TRUE)
	names <- gsub(" AZORES ","",names,fixed=TRUE)
	names <- gsub(" POLAND ","",names,fixed=TRUE)
	names <- gsub(" NORWAY ","",names,fixed=TRUE)
	names <- gsub(" ITALY ","",names,fixed=TRUE)
	names <- gsub(" JORDON ","",names,fixed=TRUE)
	names <- gsub(" ISRAEL ","",names,fixed=TRUE)
	names <- gsub(" W.GERMANY","",names,fixed=TRUE)
	names <- gsub(" E.GERMANY","",names,fixed=TRUE)
	names <- gsub(" FRANCE ","",names,fixed=TRUE)
	names <- gsub(" FINLAND","",names,fixed=TRUE)
	names <- gsub(" DENMARK ","",names,fixed=TRUE)
	names <- gsub(" BULGARI","",names,fixed=TRUE)
	names <- gsub(" YUGOSLAVIA","",names,fixed=TRUE)
	names <- gsub(" CYPRUS ","",names,fixed=TRUE)
	names <- gsub(" AUSTRIA","",names,fixed=TRUE)
	names <- gsub("  PHILIPPINE","",names,fixed=TRUE)
	names <- gsub("   SINGAPORE ","",names,fixed=TRUE)
	names <- gsub("     FRENCH ","",names,fixed=TRUE)
	names <- gsub(" NEW ZEALAND  ","",names,fixed=TRUE)
	names <- gsub(" NEW ZE ","",names,fixed=TRUE)
	names <- gsub(" S ATLANTI   ","",names,fixed=TRUE)
	names <- gsub("      GIBRALTAR ","",names,fixed=TRUE)
	names <- gsub("      AUSTRAL","",names,fixed=TRUE)
	names <- gsub("   PUERTO RIC","",names,fixed=TRUE)
	names <- gsub(" BERMUDA  ","",names,fixed=TRUE)
	names <- gsub("  USA ","",names,fixed=TRUE)
	names <- gsub("     UNITED ","",names,fixed=TRUE)
	names <- gsub("(ANT SOUTH A","",names,fixed=TRUE)
	names <- gsub("           FORMER ","",names,fixed=TRUE)
	names <- gsub("JAVA         INDONES","",names,fixed=TRUE)
	names <- gsub("     MARTINIQUE","",names,fixed=TRUE)
	names <- gsub("  GREENLAND ","",names,fixed=TRUE)
	names <- gsub("UNITED STATES   ","",names,fixed=TRUE)
	names <- gsub(" ILLINOIS    ","",names,fixed=TRUE)
  names <- gsub(" HAWAII","",names,fixed=TRUE) 
	names <- gsub("UNITED STATES   ","",names,fixed=TRUE)
	names <- gsub("   UNITED ","",names,fixed=TRUE)
	names <- gsub("  NICARAG","",names,fixed=TRUE)
	names <- gsub("   TRINIDAD  ","",names,fixed=TRUE)
	names <- gsub("   CANADA ","",names,fixed=TRUE)
  names <- gsub(" JAPAN","",names,fixed=TRUE)
  names <- gsub(",JAPAN","",names,fixed=TRUE)
  names <- gsub(" LIBYA","",names,fixed=TRUE)
   
  names <- gsub("/S. RHODESI","",names,fixed=TRUE) 
  names <- gsub(" LIBYA","",names,fixed=TRUE)
  names <- gsub(" NAIROBI","",names,fixed=TRUE)
  names <- gsub(" ALGERIA","",names,fixed=TRUE)
  names <- gsub(" CANADA","",names,fixed=TRUE)
  names <- gsub("  VENEZUE","",names,fixed=TRUE)
  names <- gsub("    SOUTH A","",names,fixed=TRUE)
  names <- gsub("    SAFR","",names,fixed=TRUE)
  names <- gsub("  PAKISTAN","",names,fixed=TRUE)
  names <- gsub("  BALEARIC I","",names,fixed=TRUE)
  names <- gsub("  ANGO  ","",names,fixed=TRUE)
  names <- gsub("     CAME","",names,fixed=TRUE)
  names <- gsub("     IVOR","",names,fixed=TRUE)
  names <- gsub("       GABON","",names,fixed=TRUE)
  names <- gsub("       GABO","",names,fixed=TRUE)
  names <- gsub("       MALA","",names,fixed=TRUE)
  names <- gsub("       EGYP","",names,fixed=TRUE)
  names <- gsub("       LIBE","",names,fixed=TRUE)
  names <- gsub("       MOROCCO","",names,fixed=TRUE)
  names <- gsub("  SENEGAL","",names,fixed=TRUE)
  names <- gsub("       SENE","",names,fixed=TRUE)
  names <- gsub("  TAIWAN","",names,fixed=TRUE)
  names <- gsub("    CHINA","",names,fixed=TRUE)
  names <- gsub("      IRAN","",names,fixed=TRUE)
  names <- gsub("    OMAN","",names,fixed=TRUE)
  names <- gsub(" SOVIET UNION","",names,fixed=TRUE)
  names <- gsub(" YEMEN","",names,fixed=TRUE)
  names <- gsub(" ARGENTINA","",names,fixed=TRUE)
  names <- gsub(" SELENGE","",names,fixed=TRUE)
  names <- gsub("GOVIALTAY"," ",names,fixed=TRUE)
  names <- gsub(" GOVIALT"," ",names,fixed=TRUE)
  names <- gsub(",SRI LANKA"," ",names,fixed=TRUE)
  names <- gsub(" BARBADOS"," ",names,fixed=TRUE)
  names <- gsub(" DOMINICAN REPUBLIC"," ",names,fixed=TRUE)
  names <- gsub(" DOMINICAN REP"," ",names,fixed=TRUE)
  names <- gsub(" DOMINICAN REPUBLI"," ",names,fixed=TRUE)
  names <- gsub(" DOMINICAN REPU"," ",names,fixed=TRUE)
  names <- gsub(" DOMINICAN REPUBL"," ",names,fixed=TRUE)
  names <- gsub("   DOMINIC"," ",names,fixed=TRUE)
  names <- gsub("  GRENADA"," ",names,fixed=TRUE)
  names <- gsub(" GUATEMALA"," ",names,fixed=TRUE)
  names <- gsub(" MEXICO"," ",names,fixed=TRUE)
  names <- gsub(" NICARAGUA"," ",names,fixed=TRUE)
  names <- gsub(".UK"," ",names,fixed=TRUE)
  names <- gsub("(NAIROBI)"," ",names,fixed=TRUE)
  names <- gsub("  CHILE"," ",names,fixed=TRUE)
  names <- gsub("  COLOMBIA"," ",names,fixed=TRUE)
  names <- gsub("   ECUADOR"," ",names,fixed=TRUE)
  names <- gsub(" PARAGUA"," ",names,fixed=TRUE)
  names <- gsub("    PERU"," ",names,fixed=TRUE)
  names <- gsub("APRT","AIRPORT ",names,fixed=TRUE)
  names <- gsub(" DOMINICAN RE"," ",names,fixed=TRUE)
  names <- gsub(" JAMAICA"," ",names,fixed=TRUE)
  names <- gsub(" PANAMA"," ",names,fixed=TRUE)
  names <- gsub("CENTRAL AFRICAN REP"," ",names,fixed=TRUE)
   
  names <- gsub(" AIRP"," AIRPORT ",names,fixed=TRUE)
  
	names <- gsub(","," ",names,fixed=TRUE)
	names <- gsub("-"," ",names,fixed=TRUE)
	names <- gsub("'"," ",names,fixed=TRUE)
  names <- gsub(","," ",names,fixed=TRUE)
  names <- gsub("-"," ",names,fixed=TRUE)
	names <- gsub("'"," ",names,fixed=TRUE)
  names <- gsub(")"," ",names,fixed=TRUE)
  names <- gsub("("," ",names,fixed=TRUE)
  names <- gsub("&"," ",names,fixed=TRUE)
	names <- gsub(" IS."," ISLAND",names,fixed=TRUE)
	names <- gsub("#"," ",names,fixed=TRUE)
  names <- gsub("."," ",names,fixed=TRUE)
	 
	names <- raster::trim(names)
 return(names)

}

readInventory <- function(filename, Constants = FILE.PARAMETERS){
  
       inventory<-       read.fwf(filename,
                                  widths = Constants$InvWidths,
                                  comment.char = "", stringsAsFactors = FALSE,
                                  col.names = Constants$InvNames)
                     
      inventory$Elevation       <- gsub("-999", NA , inventory$Elevation) 
      inventory$Population      <- gsub("-9", NA , inventory$Population) 
      inventory$Vegetation      <- gsub("xx", NA , inventory$Vegetation) 
      inventory$DistanceToCoast <- gsub("-9", NA , inventory$DistanceToCoast) 
      inventory$Airport         <- gsub("A","TRUE", inventory$Airport) 
      inventory$Airport         <- gsub("x","FALSE", inventory$Airport) 
      inventory$DistanceToTown  <- gsub("-9", NA , inventory$DistanceToTown)
      inventory$Name            <- gsub("#", " " , inventory$Name)
      inventory$GridEl          <- as.numeric(inventory$GridEl)
      inventory$Elevation       <- as.numeric(inventory$Elevation)
      inventory$DistanceToTown  <- as.numeric(inventory$DistanceToTown)
      inventory$Population      <- as.numeric(inventory$Population)
      inventory$DistanceToCoast <- as.numeric(inventory$DistanceToCoast)
      inventory$Airport         <- as.logical(inventory$Airport)
      inventory$Name            <- .cleanInvNames(inventory$Name)
      
  return(inventory)
  
}



 

readQC <- function(filename, Parameters = FILE.PARAMETERS  ){
  
    x <- read.fwf(filename,
                   widths = Parameters$DataWidths,
                   comment.char = "",
                   col.names = Parameters$DataNames,
                   na.strings = " ", stringsAsFactors = FALSE)
     
     
    qc <- x[ ,Parameters$QCFlags]
    colnames(qc) <- c("Id","Year","Jan","Feb","Mar","Apr","May", 
                      "Jun","Jul","Aug","Sep","Oct","Nov","Dec")
    
    dm <- x[ ,Parameters$DMFlags]
    colnames(dm) <- c("Id","Year","Jan","Feb","Mar","Apr","May", 
                      "Jun","Jul","Aug","Sep","Oct","Nov","Dec")
    ds <- x[ ,Parameters$DSFlags]
    colnames(ds) <- c("Id","Year","Jan","Feb","Mar","Apr","May", 
                      "Jun","Jul","Aug","Sep","Oct","Nov","Dec")
    
    return(list(QC = qc, DM = dm, DS = ds))
        
}

readMask <- function(filename){
    require("raster")  
    land  <- read.table(filename, sep = " ")
    world <- raster(as.matrix(land),xmn = -180, xmx = 180, ymn = -90, ymx = 90,
                  crs = "+proj=longlat +datum=WGS84")     
    return(world/100) 
}

readMaskDeg1 <- function(){
  f <- system.file("external/landmask1x1.grd", package = "RghcnV3")
  return(raster(f))
}

readSST <- function(filename){
   require("ncdf")
   require("raster")
   require("zoo")
    
   sea <- brick(x = filename, varname = "sst")
   sea <- setZ(sea, as.yearmon(layerNames(sea)), name = 'time')
   layerNames(sea) <- as.yearmon(layerNames(sea))
   return(sea)   
   
}

readHadMaps  <- function(filename,start = 1850){
    require("ncdf")
    require("raster")
    require("zoo")   
   cru <- brick(x = filename, varname = "temp")
   z  <- as.yearmon(start + seq(0 ,nlayers(cru) - 1)/12)
   cru <- setZ(cru, z, name = "time")
   layerNames(cru) <- as.yearmon(start + seq(0 ,nlayers(cru) - 1)/12) 
 return(cru)      
}
   

readHadResults <- function(url = c(HADSST2.RESULTS.URL, HADCRUT3.RESULTS.URL,
                                   CRUTEMP3.RESULTS.URL)){
    
    require("zoo")
    if (length(url) > 1){
       cat("PASS one url ONLY", url,"\n")
       warning(cat(" using the first element", url[1],"\n"))
    }
    HadCheck <- read.table(url[1], fill = TRUE)
    records  <- length(HadCheck[, 1])
    odds     <- records
    evens    <- records
    if (records %% 2 == 0) odds <- records - 1
    if (records %% 2 == 1) evens <- records - 1
    HadTemps   <- HadCheck[seq(1, odds, by = 2) ,]     
    start <- HadCheck[1,1]
    end   <- max(HadCheck[ ,1])     
    ty <- (end + 1 ) - start    
    HadMonthly <- c(t(HadTemps[ ,2:13]))
     
    tim <- as.yearmon(start + seq(0, (ty * 12) - 1)/12)   
  return(zoo(HadMonthly, order.by = tim)) 
   
}
    
   

  
 
             
 
