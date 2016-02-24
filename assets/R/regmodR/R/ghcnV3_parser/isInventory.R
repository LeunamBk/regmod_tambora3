isInventory <- function (inv){
    if (isArray(inv)){
      return(FALSE)
    } else {
      if (!is.data.frame(inv)) return(FALSE)
      if (is.data.frame(inv)){
         if (names(inv)[1] != "Id"){
             return(FALSE)
         }
         if (names(inv)[2] != "Lat"){    
             return(FALSE)
         }
         if (names(inv)[3] != "Lon"){    
             return(FALSE)
         }
         return(TRUE)
      }
    }
}