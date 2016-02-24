#!/bin/python
# -*- coding: utf-8 -*-
"""
Reconstructs temperature fields based on selected indexfields regression data from db
TODO: Work in progress! Implement try and excepts, substitute hardcoded dimensions (81,161)
Created on Mon May 11 23:00:15 2015

@author: Manuel Beck
"""                  

"""
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# LIBRARIES:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""


import numpy as np
# debug show full numpy array
np.set_printoptions(threshold='nan')
import h5py
import warnings
from copy import deepcopy
import os

# import command line arguments validator
from argvValidate import readDataArgv
# validate user input

# import function for reading required hdf5 data
from utils import getHdf5Data

indexvalues, n, year, month = readDataArgv()

# get absolute file path
PATH = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))
# test indexvalues table
#indexvalues = np.matrix([[35,9,-2],[60,13,3]])
n = indexvalues.shape[0]
grid = .5
hdf5PATH = PATH+'/CRU/cruMonth_'
month = 1


hdf5Dataset = getHdf5Data(hdf5PATH, month, ['maps', 'longitude', 'latitude'])
cruMaps = hdf5Dataset[0]
cruLongitude = hdf5Dataset[1]
cruLatitude = hdf5Dataset[2]

# calculate mean and Standard deviation from ~100 year monthly cru data
with warnings.catch_warnings():
    # expect to see RuntimeWarnings in this block => Mean/Std of empty (NaN) slice
    warnings.simplefilter("ignore", category=RuntimeWarning)
    cruMapMean = np.nanmean(cruMaps, axis=2)
    cruMapStd = np.nanstd(cruMaps, axis=2)
 

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
cruMapsColumns = cruMaps.T.reshape(100, 13041)    
ufa = ufa.reshape(100, n)

# calculate correlation of data point with 100 year mean temp fields
# memory problems therefore for loop
korrels=[]
for i in range(0,13041):
    korrels.append(np.corrcoef(cruMapsColumns[:,i], ufa, rowvar=0)[0])

# convert to numpy array
korrels = np.array(korrels,dtype=float)[:,1:n+1]

# retransform maps in columns to one map for every column 2d -> 3d array
korrels_map = korrels.reshape(81,161,n)

# get map with max values from each map layer 3d -> 2d array
with warnings.catch_warnings():
    # expect to see RuntimeWarnings in this block => Max of empty (NaN) slice
    warnings.simplefilter("ignore", category=RuntimeWarning)
    region_repr = np.nanmax(korrels_map, axis=2)
 
# set grid cells with correlation value minor than schwelle_temp to NaN 
region_repr[region_repr < 0.9] = np.nan
korrels_map[korrels_map < 0.9] = np.nan

# transform region_repr map to column vector
region_repr_columns = region_repr.reshape(13041,1)

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
    # indices_recon = tmp_indices_recon / tmp_weighting
    indices_map = np.nanmean(indices_map, axis=2)
  
print cruMapsColumns.shape
""" 
reconstructed <- reconstruct(
idxvalues [X]
indices_rekon [X] => indices_map
maps_sel_incolumns [X] => cruMapsColumns
region_repr_columns [X] => region_repr_columns
latitude [X] => cruLatitude
longitude [X] => cruLongitude
cruMapMean [X]
cruMapStd  [X]
a1 [X] => 0.85
"""
#print indices_recon.shape    
print np.nanmin(indices_map)
print np.nanmax(indices_map)
print np.nanmean(indices_map)
"""
print np.nanmin(indices_recon)
print np.nanmax(indices_recon)
print np.nanmean(indices_recon)


print np.nanmin(indices_recon[:,:,1])
print np.nanmax(indices_recon[:,:,1])
print np.nanmean(indices_recon[:,:,1])
"""    
# transform region_repr map to column vector
# region_repr_columns <- matrix(t(region_repr), length(longitude) * length(latitude), 1)

#reconstructed <- reconstruct(idxvalues, indices_rekon, maps_sel_incolumns, region_repr_columns, latitude, longitude, cruMapMean, cruMapStd, a1)
  
#print region_repr.shape
#print np.nanmin(region_repr)
#print np.nanmax(region_repr)
#print np.nanmean(region_repr)

