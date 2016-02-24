# groups index points for exact same location to one singel index point by mean value 

groupby <- function(data, column, method = 'nanmean'){
  # group data by location give mean idx value
  data.idx <- aggregate(data[,column], by=list(data[,1],data[,2]), FUN=mean)
  
  # if data was grouped handle event_id appropriate (this groupby should be done in the database layer not in the model layer!!!)
  if(dim(data) != dim(data.idx)){
    data.event_id <- aggregate(data[,4], by=list(data[,1],data[,2]), FUN=max)
    data.idx <- cbind(data.idx,data.event_id[,3])
    return(data.idx)
  }else{
    return(data)
  }
}

# groupby <- function(data, columns, method = 'nanmean'){
#   
#   # define sort function for apply; default is increasing
#   decreasingSort <- function(data){
#     sort(data,decreasing = TRUE)
#   }
#   
#   data <- apply(data, 2, decreasingSort)
#   
# }
