#!/bin/python
# -*- coding: utf-8 -*-
### write numpy array as geoitiff to disk

import sys
import numpy as np
import os
# append path for osgeo gdal to resolve "No module named _gdal_array" conflict
sys.path.insert(0, '/home/manuel/regmod/postgis-cb-env/lib/python2.7/site-packages/')
from osgeo.gdalconst import *

         
def numpy2geotiff(numpyArr, lat, lon, tempTiffFile):
    # modified from: http://gis.stackexchange.com/a/37431
    from osgeo import osr
    import gdal
                               
    # image data
    array = np.flipud(numpyArr)
                                                                 
    # get upper left corner coordinates
    xmin,ymin,xmax,ymax = [lon.min(),lat.min(),lon.max(),lat.max()]
    nrows,ncols = np.shape(array)
    xres = (xmax-xmin)/float(ncols)
    yres = (ymax-ymin)/float(nrows)
    geotransform=(xmin,xres,0,ymax,0, -yres)   
    # That's (top left x, w-e pixel resolution, rotation (0 if North is up), 
    #         top left y, rotation (0 if North is up), n-s pixel resolution)
    
    # create geotiff and write to disk
    output_raster = gdal.GetDriverByName('GTiff').Create(tempTiffFile, ncols, nrows,1 , gdal.GDT_Float32)  # Open the file
    output_raster.SetGeoTransform(geotransform)  # specify coordinates
    srs = osr.SpatialReference()                 # establish coordinate encoding
    srs.ImportFromEPSG(4326)                     # WGS84 (4326) lat long.
    output_raster.SetProjection( srs.ExportToWkt() )   # export coordinate system to file
    output_raster.GetRasterBand(1).WriteArray(array)   # Writes array to raster
    output_raster.FlushCache()                    # write file

####################################
# read command line args    

# get command line arguments
csvFile = sys.argv[1]
tiffPath = sys.argv[2]
latMin = sys.argv[3]
latMax = sys.argv[4]
lonMin = sys.argv[5]
lonMax = sys.argv[6]

dataArray = np.recfromtxt(csvFile , delimiter=',')
lat = np.array((latMin, latMax))
lon = np.array((lonMin, lonMax))

numpy2geotiff(dataArray, lat, lon, tiffPath)