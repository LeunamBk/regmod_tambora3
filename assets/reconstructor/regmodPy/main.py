#!/bin/python
# -*- coding: utf-8 -*-
"""
Reconstructs temperature fields based on selected indexfields regression data from db
=> script needs writing permission for tempTiff directory
Created on Mon May 11 23:00:15 2015

@author: Manuel Beck <manuelbeck@outlook.com>
"""                  

"""
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# LIBRARIES:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""

import numpy as np
from sklearn.preprocessing import scale
import psycopg2
import sys
import os
import json
import warnings

# debug show full numpy array
np.set_printoptions(threshold='nan')

"""
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# FUNCTIONS:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""

# import postgres interaction functions
from postgresInt import sendDbQuery, getPgData, getPgRast, geotiff2psql, raster2MapDb

# import regmod statistic functions and main reconstruct function
from pcaStats import pca, mlr, reconstruct

# import command line arguments and validate
from argvValidate import readDataArgv

# import function for reading required hdf5 data
from utils import getHdf5Data, getCruData

# import function for the regionalisation by regression analysis of events based on 100 years cru reanalysis data
from regionalise import regionalise 

"""
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# CONFIGURATION:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""

# db credentials
dbHost = "localhost"

"""
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# RUN:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""

# read from argv input
indexvalues, n, year, month, dbName, dbPort, dbUser, dbPass, tempTiff, NCPATH  = readDataArgv()

# define db connection string
conn = psycopg2.connect("host="+dbHost+" dbname="+dbName+" port="+dbPort+" user="+dbUser+" password="+dbPass)

lat = indexvalues[:,0]
lon = indexvalues[:,1]

latMin = np.min(lat)-10
latMax = np.max(lat)+10
lonMin = np.min(lon)-15
lonMax = np.max(lon)+15

dimLon = np.array((lonMin,lonMax))
dimLat = np.array((latMin,latMax))

# define arguments
cruDataset = getCruData(month, dimLon, dimLat, NCPATH)
cruMaps = cruDataset[0]
cruLongitude = cruDataset[1]
cruLatitude = cruDataset[2]

# calculate mean and Standard deviation from ~100 year monthly cru data
with warnings.catch_warnings():
    # expect to see RuntimeWarnings in this block => Mean/Std of empty (NaN) slice
    warnings.simplefilter("ignore", category=RuntimeWarning)
    cruMapMean = np.nanmean(cruMaps, axis=2).T.reshape(cruMaps.shape[1],cruMaps.shape[0])
    cruMapStd = np.nanstd(cruMaps, axis=2).T.reshape(cruMaps.shape[1],cruMaps.shape[0])

#  indices_map == indicesRecon
indicesRecon, cruMapsColumns, regionReprInCol, regressionMap = regionalise(indexvalues, cruMaps, cruLongitude, cruLatitude, n)

# regression map trim raster, write as geotiff and upload to db with metadata
raster2MapDb(regressionMap, latMin, lonMin, tempTiff, conn, year, month, dbUser, dbName, 'regression')

print '################################################'
print month
print cruMaps.shape
print regionReprInCol.shape
print cruMapsColumns.shape
print '################################################'

# get scoredata
mask = ~np.isnan(regionReprInCol)[:,0]
scoredata = cruMapsColumns[:,mask].T 

# scale and center data (has minimal offset in mean to R/Matlab => floating point 10^-17)
zscore = scale(scoredata, axis= 0, with_mean=True, with_std=True, copy=False).T 

# reconstruct temperature field
reconstructed = reconstruct(zscore, regionReprInCol, indicesRecon, cruMapsColumns, cruMapStd) 

# trim raster, write as geotiff and upload to db with metadata
raster2MapDb(reconstructed, latMin, lonMin, tempTiff, conn, year, month, dbUser, dbName)

# close db connection
conn.close()           