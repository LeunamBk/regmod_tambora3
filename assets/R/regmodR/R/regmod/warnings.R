# warnings.R info user about whats happens

# from regionalize

#throw Warning function to inform the user about changes in input data!!! 
throwWarning <- function(trace){
  print(paste("Warning Testregion dimensions out of bbox of selected map +-8 / 12 ! Dimensions changed to bbox.",trace, sep=" "))
}

# validates user input value bottom left with have to value 
checkbbdim <- function(checksum, value){
  ifelse(checksum <= value, T, F)
}

#
setValueAndWarn <- function(setter, warnmes = "setValue Error" ){
  throwWarning(warnmes)
  return(setter)
}
