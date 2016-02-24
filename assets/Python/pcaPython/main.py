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
import warnings

from tabulate import tabulate

# debug show full numpy array
np.set_printoptions(threshold='nan')

"""
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# FUNCTIONS:
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""

# import postgres interaction functions
from postgresInt import sendDbQuery, getPgData, getPgRast, geotiff2psql

# import regmod statistic functions and main reconstruct function
from pcaStats import pca, mlr, reconstruct

# import raster manipulation and geotiff creation functions 
from np2geotiff import numpy2geotiff, trimRaster

# import command line arguments validator
from argvValidate import validateArgvInt

# import function for reading required hdf5 data
from utils import getHdf5Data, getCruData

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

# validate user input for integer
validateArgvInt(sys.argv[2])
validateArgvInt(sys.argv[7:])

# get command line arguments
dbName = sys.argv[1]
dbPort = sys.argv[2]
dbUser = sys.argv[3]
dbPass = sys.argv[4]
temTiffPath = sys.argv[5]
NCPATH = sys.argv[6]
year = sys.argv[7]
month = int(sys.argv[8])
evIdsList = [int(arg) for arg in sys.argv[9:]]
evIdsStr =  ", ".join(sys.argv[9:])

# set path to temp geotiff file            
tempTiff = temTiffPath+'/temp.tif'

# define db connection string
conn = psycopg2.connect("host="+dbHost+" port="+dbPort+" dbname="+dbName+" user="+dbUser+" password="+dbPass)

# get region_rep => max raster of all carresponding correlation rasters
query = """SELECT (ST_METADATA(ST_UNION(rast,'MAX'))).*, ST_DUMPVALUES(ST_Union(rast, 'MAX'))
FROM regmod.temperature_monthly_regio_weight
WHERE event_id IN(""" + evIdsStr + """)
"""

# get region representative with metadata for correct trim of result raster later
regionRepr, metadata  =  getPgRast(conn, query, True)

# get indices_recon
query = """SELECT ST_DUMPVALUES(ST_Union(rast, 'MEAN'))
FROM regmod.temperature_monthly_regio_idxrec
WHERE event_id IN(""" + evIdsStr + """)
"""

indicesRecon =  getPgRast(conn, query)  

# get weighting
query = """SELECT ST_DUMPVALUES(ST_Union(rast, 'MEAN'))
FROM regmod.temperature_monthly_regio_weight
WHERE event_id IN(""" + evIdsStr + """)
"""

weighting =  getPgRast(conn, query)   

# transform region_repr map to column vector
regionReprInCol = regionRepr.reshape(regionRepr.shape[0]*regionRepr.shape[1],1)

# define data bounding box
dimLat = np.array((metadata[1]+(metadata[5]*metadata[3]), metadata[1]))
dimLon = np.array((metadata[0], metadata[0]+(metadata[4]*metadata[2])))

# get reanalysis data for bbox
cruDataset = getCruData(NCPATH, month, dimLon, dimLat)
cruMaps = cruDataset[0]
cruLongitude = cruDataset[1]
cruLatitude = cruDataset[2]

# calculate mean and Standard deviation from reanalysis data
with warnings.catch_warnings():
    # expect to see RuntimeWarnings in this block => Mean/Std of empty (NaN) slice
    warnings.simplefilter("ignore", category=RuntimeWarning)
    cruMapMean = np.nanmean(cruMaps, axis=0) #.T.reshape(cruMaps.shape[1],cruMaps.shape[0])
    cruMapStd = np.nanstd(cruMaps, axis=0) #.T.reshape(cruMaps.shape[1],cruMaps.shape[0])

# 3d to 2d array by column e.g.: 100 81 161 to 100 13041
mSelCol = cruMaps.reshape(cruMaps.shape[0], cruMaps.shape[1]*cruMaps.shape[2])

# get scoredata
mask = ~np.isnan(regionReprInCol)[:,0]
scoredata = mSelCol[:,mask].T

# scale and center data (has minimal offset in mean to R/Matlab => floating point 10^-17)
zscore = scale(scoredata, axis= 0, with_mean=True, with_std=True, copy=False).T
print scoredata.shape

# recalculate reconstructed indices (saves one db query)
indicesRecon = indicesRecon/weighting

# reconstruct temperature field
reconstructed = reconstruct(zscore, regionReprInCol, indicesRecon, mSelCol, cruMapStd) 

# create geotiff
numpy2geotiff(reconstructed , dimLat, dimLon, tempTiff)

# write geotiff to postgres and return event hash for php postgres query
geotiff2psql(conn, year, month, evIdsStr, dbUser, dbName, dbPort, tempTiff) 

# close db connection
conn.close()           