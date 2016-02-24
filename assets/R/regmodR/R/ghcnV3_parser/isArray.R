isArray <- function(x){
  
    if ( !is.array(x)) return(FALSE)
    if ( dim(x)[2] != 12) return(FALSE)
    if ( length(dim(x)) != 3) return(FALSE)
    monthNames <- unlist(dimnames(x)[2])
    if (!identical(monthNames,month.abb)) return(FALSE)
    
    return(TRUE)
      
}