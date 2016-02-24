#!/bin/python
# -*- coding: utf-8 -*-

from copy import deepcopy
import numpy as np
import warnings

# TODO get rid of hardcoded values
def regionalise(indexvalues, cruMaps, cruLongitude, cruLatitude, n, grid = .5):
  
    years = cruMaps.shape[2]
    lats = cruMaps.shape[0]
    lons = cruMaps.shape[1]
    print "ZZZZZZZZZZZZZZZZZZZZZZZZZ"
    print years, lats, lons
    ## create vector for every idx value with cru value at position lat lon
    # get matrix position of lat lon data
    x = ((indexvalues[:,0]-np.min(cruLatitude))/grid) 
    y = ((indexvalues[:,1]-np.min(cruLongitude))/grid) 
    # extract every value for every month at lat lon matrix position 
    # and build vektor for every index from that 
    ufa = np.empty((cruMaps.shape[2],indexvalues.shape[0],))
    ufa[:] = np.NAN
    for i in range(0, indexvalues.shape[0]):
        ufa[:,i] = cruMaps[int(y[i]),int(x[i]),:]
   
    # 3d to 2d array by column e.g.: 100 81 161 to 100 13041
    cruMapsColumns = cruMaps.T.reshape(years, lats*lons)    
    ufa = ufa.reshape(years, n)
   
    # calculate correlation of data point with 100 year mean temp fields
    # memory problems therefore for loop
    korrels=[]
    for i in range(0,lats*lons):
        korrels.append(np.corrcoef(cruMapsColumns[:,i], ufa, rowvar=0)[0])

    # convert to numpy array
    korrels = np.array(korrels,dtype=float)[:,1:n+1]

    # retransform maps in columns to one map for every column 2d -> 3d array
    korrels_map = korrels.reshape(lons,lats,n)
    
    # get map with max values from each map layer 3d -> 2d array
    with warnings.catch_warnings():
        # expect to see RuntimeWarnings in this block => Max of empty (NaN) slice
        warnings.simplefilter("ignore", category=RuntimeWarning)
        region_repr = np.nanmax(korrels_map, axis=2)
         
    # set grid cells with correlation value minor than schwelle_temp to NaN 
    region_repr[region_repr < 0.9] = np.nan
    korrels_map[korrels_map < 0.9] = np.nan

    # transform region_repr map to column vector
    region_repr_columns = region_repr.reshape(lats*lons,1)

    # calculate indices map
    # uncomment lines for single field reconstruction and 
    # interim results handling 
    indices_map = deepcopy(korrels_map)  
    # indices_recon = deepcopy(korrels_map)  
    for (i, index) in enumerate(indexvalues):
        mask = indices_map[:,:,i] > 0 
        indices_map[mask,i] = int(index[:,2])                              
        # weighted indices map 
        # indices_recon[:,:,i] = indices_map[:,:,i] * korrels_map[:,:,i]
    
    # unify all indexmaps to one by average
    with warnings.catch_warnings():
        # expect to see RuntimeWarnings in this block => Max of empty (NaN) slice
        warnings.simplefilter("ignore", category=RuntimeWarning)
        # tmp_indices_recon = np.nanmean(indices_recon, axis=2)
        # tmp_weighting = np.nanmean(korrels_map, axis=2)
        regressionMap = np.nanmax(korrels_map, axis=2)
        # indices_recon = tmp_indices_recon / tmp_weighting
        indices_map = np.nanmean(indices_map, axis=2)

    return indices_map, cruMapsColumns, region_repr_columns, regressionMap