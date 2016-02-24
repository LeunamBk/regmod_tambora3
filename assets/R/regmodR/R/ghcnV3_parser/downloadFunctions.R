# download validation data
downloadV3 <- function(url = V3.MEAN.ADJ.URL, directory = getwd(), overwrite = TRUE, remove = FALSE) {
  if (!file.exists(directory)) dir.create(directory)
  fullDestination <- file.path(directory, basename(url), fsep = .Platform$file.sep)
  download.file(url, destfile = fullDestination, mode = "wb")
  gunzip(fullDestination, overwrite = overwrite, remove = remove)
  
  # replace  .gz  with nothing for untar
  tarName <- sub(".gz", "", fullDestination, fixed = TRUE)
  theseFiles <- untar(tarName, list = TRUE, tar = "internal")
  
  untar(tarName, exdir = directory, tar = "internal")
  theseFiles <- gsub("./", "", theseFiles, fixed = TRUE)
  theseFiles <- file.path(directory, theseFiles, fsep =.Platform$file.sep)
  localDir   <- dirname(theseFiles)
  localDir   <- localDir[1] 
  dateString <- substring(localDir, first = nchar(localDir) - 7)
  
  data       <- grep(x = theseFiles, pattern = ".dat", fixed = TRUE)
  inv        <- grep(x = theseFiles, pattern = ".inv", fixed = TRUE)
  
  return(list(DataFilename  = theseFiles[data],
              InventoryFile = theseFiles[inv],
              Date          = strptime(dateString, format = "%Y%m%d")
  ))
}


# read data
readV3Data  <- function(filename, output = c("Array","Mts","Zoo"), Parameters = FILE.PARAMETERS){
  
  if (length(output) > 1) {
    warning("Select One of either V3 or ARRAY or Mts. Using first element by default")
    returnType  <- output[1]
  } else {
    returnType  <- output
  }
  
  txt <- readLines(filename) 
  n <-   length(txt) 
  out <- matrix(NA,n,14)  
  out[,1] <- as.numeric(substr(txt,1,11)) 
  out[,2] <- as.numeric(substr(txt,12,15)) 
  ii <- seq(from =20, to = 108, by = 8 ) 
  for(i in 1:12)out[ ,i + 2] <- as.numeric(substr(txt, ii[i], ii[i] +4 ))/100 
  out[out == -99.99] <- NA
  
  minYear <- min(out[ ,2])
  out    <- .toArray(out)
  if (returnType == "Mts" | returnType == "Zoo"){
    out <- apply(out,MARGIN = 1, FUN = c)
    out <- ts(out, start = minYear, frequency = 12)
    if (returnType == "Zoo") out <- asZoo(out)
  }
  
  return(out)    
}    

windowArray <-function(Data, start, end){
  if (!isArray(Data)) stop(" Data must be an array")
  if (start > end)stop("start must be less than end")
  if(start %% 1 != 0){
    warning(cat(start, " is being trimmed to ", floor(start), "\n"))
    start <- floor(start)
  } 
  if(end %% 1 != 0){
    warning(cat(end, " is being trimmed to ", floor(end), "\n"))
    end <- floor(end)
  }
  years <- as.numeric(unlist(dimnames(Data)[3]))
  begin <- which(years == start)
  end   <- which(years == end)
  Data <-  Data[ , ,begin:end]
  
  return(Data)
}
