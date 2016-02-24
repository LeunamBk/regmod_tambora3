reconstruct <- function(idxvalues, indices_rekon, maps_sel_incolumns, region_repr_columns, latitude, longitude, cruMapMean, cruMapStd, index.weight, pca.quality){
  
  if(idxvalues[3] != 0){

    # changed from default 20 main components roughfly four are normaly used
    n <- 20 # max amount of main components
    
    # calculate scoredata for pca
    scoredata <- t(maps_sel_incolumns[,!is.na(region_repr_columns)])
 
    # calculate zscore for scoredata
    zscore <- t((scale(scoredata)))
    
    # calculate Principal Components Analysis from zscore (# prcomp(x, ...) Principal Components Analysis 
    # http://stat.ethz.ch/R-manual/R-patched/library/stats/html/princomp.html)
    prcomp_data <- prcomp(zscore)
    
    # pca results
    # loadings
    allhkas_temp <- prcomp_data$rotation
    
    # scores
    projektions <- prcomp_data$x
    
    # eigenvek
    eigenvek <- prcomp_data$sdev^2
    
    # pca test
    ## test.pca(zscore, maps_sel_incolumns, region_repr_columns, allhkas_temp, projektions, eigenvek, n)
    
    # check if hk's found 
    if (length(allhkas_temp) == 0){
      reconstructed <- idx_map
      print('NO hk')
    }
    
    # check if less than 20 hks are available
    if(ncol(allhkas_temp)<n){
      n <- ncol(allhkas_temp)
    }
    
    # prepare hk's matrix 
    allhkas <- matrix(NaN, ncol(maps_sel_incolumns), n)
    
    allhkas[!is.na(region_repr_columns),] <- allhkas_temp[,1:n]
    erkl_var <- eigenvek[1:n]/sum(eigenvek)

    # changed from < .95
    n <- cumsum(erkl_var) < pca.quality
    n <- sum(n, na.rm = T)
    
    # will be substituted by underlying array function 
    # columns to maps for 3d array data (The dimensionality of an array is just an attribute)
    allhkas <- allhkas[,1:n]
    dim(allhkas) <- c(length(longitude), length(latitude), n) 
    allhkas <- aperm(allhkas, c(2,1,3))
    
    mregres <- maps_multiple_regression(allhkas, indices_rekon * index.weight)
    reconstructed <- mregres[[1]] 
    coefficient <- mregres[[2]]
    rm(mregres) # remove tmp data
    
    # Test mlr
    ## test.mlr(reconstructed, coefficient, allhkas, erkl_var, n, allhkas, indices_rekon, a1 )
    
    if(sum(coefficient)==0){
      reconstructed               <-   indices_rekon * index.weight
      print('indexfeld_mlr')
      
    } else {
      reconstructed <- columns2maps(t(reconstructed),length(longitude))
      print('mlr')
    }
  } else {
    reconstructed               <- indices_rekon * index.weight
    print('indexfeld')
}
  
  
  # test, ob reconstructede normalisierte temperatur richtig: indexwert an
  # dieser stelle *a1
  #reconstructed[which(latitude==idxvalues[1,1]),which(longitude==idxvalues[1,2])]
  
  # recunstruction
  reconstructed <- (as.vector(reconstructed) * cruMapStd) + cruMapMean
  
  
  # calculate summary statistics
  cruMap <- toRaster(cruMapMean, longitude, latitude)
  regMap <- toRaster(reconstructed, longitude, latitude)
  cruMap.trim <- mask(cruMap, regMap)
  tMeanDiff <- (nanmean(values(regMap)) - nanmean(values(cruMap.trim)))
  print(paste('MeanTemp diff:', tMeanDiff, sep=''))
  # test.checkReconMaps(reconstructed, maps_sel, cruMapMean, cruMapStd, a1)
  
  return(reconstructed)
}