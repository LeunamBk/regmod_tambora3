saveInterimResults <- function(idxvalues, korrels_map, regression.quality, longitude, latitude, maps_sel_incolumns, cruMapMean, cruMapStd, index.weight, pca.quality){

  # idxfield recunstruct for all data points (pca)
  indices_rekon <- array(0, c(nrow(idxvalues), dim(korrels_map)[2], dim(korrels_map)[3]))
  weighting <- array(0, c(nrow(idxvalues), dim(korrels_map)[2], dim(korrels_map)[3]))
  
  # reconstruct temperature by index correlation fields
  print('single field reconstruction') 
  for(i in 1:nrow(idxvalues)){

    region_repr_single <- korrels_map[i,,]
    region_repr_single[region_repr_single < regression.quality] <- NaN
    
    # for all data points reconstruction
    weighting[i,,] <- region_repr_single
    
    region_repr_single[region_repr_single > 0] <- idxvalues[i,3]
    
    # for all data points reconstruction
    indices_rekon[i,,] <- region_repr_single * weighting[i,,]
    region_repr_columns_single <- matrix(t(region_repr_single), length(longitude) * length(latitude), 1)
    
    # reconstruct temperature filed
    reconres <- reconstruct(idxvalues[i,], region_repr_single, maps_sel_incolumns, region_repr_columns_single, latitude, longitude, cruMapMean, cruMapStd, index.weight, pca.quality)
    
    if(!exists('manualExe')){
      # save reconstructed map as clipped png to filesystem and make db entry
      raster2mapView(reconres, longitude, latitude, year, month, 'single', idxvalues[i,4], idxvalues[i,3])
      
      # save for live pca
      raster4LivePca(year, month, idxvalues[i,], indices_rekon[i,,], 'idxRecPca', latitude, longitude)
      raster4LivePca(year, month, idxvalues[i,], weighting[i,,], 'weightPca', latitude, longitude)
    } 
  }

  # unify all indexmaps to one by average
  tmp_indices_rekon <- apply(indices_rekon, c(2,3), nanmean)
  tmp_weighting <- apply(weighting, c(2,3), nanmean)
  indices_rekon <- tmp_indices_rekon/tmp_weighting
 
  return(indices_rekon)
}