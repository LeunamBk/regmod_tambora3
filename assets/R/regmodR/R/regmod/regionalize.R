regionalize <- function(idxvalues, maps_sel, longitude, latitude, regression.quality, grid){

  # possibility here to shrink the area which will be taken into account for 
  # regression analysis of each index point (faster computing of regression etc. ...)
  # default: no limitations 
  #lat <- c(min(idxvalues[,1])-8, max(idxvalues[,1])+8)
  #lon <- c(min(idxvalues[,2])-12, max(idxvalues[,2])+12)
  lon <- c(min(longitude), max(longitude))
  lat <- c(min(latitude), max(latitude))
  
  # tests selected maps from R with Matlab in function regionalize
  ## test.maps_sel_Regio(maps_sel, longitude, latitude, maps_sel, lon, lat)
 
  # 3d to 2d array by column e.g.: 100 81 161 to 100 13041
  x <- ((idxvalues[,1]-min(latitude))/grid)+1
  y <- ((idxvalues[,2]-min(longitude))/grid)+1
  ufa<-matrix(NA,dim(maps_sel)[1],length(x))
  for(i in 1:length(x)){
    ufa[,i] <- cbind(maps_sel[,x[i],y[i]])
  }
  
  maps_sel_incolumns <- t(apply(aperm(maps_sel),3,c))
  
  # Test above pre korrels values 
  ## test.preKorrels(idxvalues, idx_map, idx_pre, maps_sel_incolumns, ufa, ui)
  # calculate correlation of data point with 100 year mean temp fields
  korrels <- cor(ufa,  maps_sel_incolumns, use = "pairwise.complete.obs")

  # retransform maps in columns to one map for every column 2d -> 3d array
  korrels_map <- columns2maps(korrels, length(longitude))

  # get map with max values from each map layer 3d -> 2d array
  region_repr <- apply(korrels_map, c(2,3), nanmax)
  
  # set grid cells with correlation value minor than regression.quality to NaN 
  region_repr[region_repr < regression.quality] <- NaN
  
  # transform region_repr map to column vector
  region_repr_columns <- matrix(t(region_repr), length(longitude) * length(latitude), 1)
  
  return(list(korrels_map, maps_sel_incolumns, region_repr_columns))  
}