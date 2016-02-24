#!/bin/python
# -*- coding: utf-8 -*-
### write csv as geotiff to disk

import sys
import numpy as np
import os
#import osr
#import gdal
#import gdalconst

# remove this on tambora uni server
# append path for osgeo gdal to resolve "No module named _gdal_array" conflict
sys.path.insert(0, '/home/manuel/regmod/postgis-cb-env/lib/python2.7/site-packages/')
from osgeo.gdalconst import *
####                  
         
def numpy2geotiff(numpyArr, lat, lon, tempTiffFile):
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
    
# trim raster to actual data extent   
def trimRaster(raster, centerY, centerX, metadata = None):
    
    PADDINGMIN = 1
    PADDINGMAX = 2
    
    ymin = min(np.where(~np.isnan(raster))[0])
    ymax = max(np.where(~np.isnan(raster))[0])
    xmin = min(np.where(~np.isnan(raster))[1])
    xmax = max(np.where(~np.isnan(raster))[1])
    
    # leave NA data border
    if(xmin != 0):
        xmin -= PADDINGMIN
        xmax += PADDINGMAX
        ymin -= PADDINGMIN
        ymax += PADDINGMAX
            
    # prepare result raster data array
    rasterTrimed = np.empty(((ymax-ymin),(xmax-xmin),))
    rasterTrimed[:] = np.nan

    rasterTrimed = raster[ymin:ymax,xmin:xmax]

    # calculate new lat lon vector of trimed data
    # pay attention here when new world region (!= central europe) is defined for calculation
    # may cause problems with meta data scale and center +/-  
    if metadata:
        center = metadata[0]*-1
        yscale = metadata[5]*-1
        xscale = metadata[4]
    else:
        # hardcoded for simplicity no time for advanced stuff... (->convert to raster in r and pass xmin, ymin xres and yres to here) 
        yscale = 0.5
        xscale = 0.5
        if(xmin == 0):
            # this scaling results in best overall fit for world data
            centerXmin = centerX #- 0.25 #-0.3
            centerXmax = centerX# + 0.25
            centerYmin = centerY #+ 0.25
            centerYmax = centerY #- 0.25 #-0.3

            Yminb = ((yscale*(ymin))+centerYmin)
            Ymaxb = ((yscale*(ymax))+centerYmax)
            Xminb = ((xscale*(xmin))+centerXmin)
            Xmaxb = ((xscale*(xmax))+centerXmax)
        else:
            Yminb = ((yscale*(ymin))+centerY)
            Ymaxb = ((yscale*(ymax))+centerY)
            Xminb = ((xscale*(xmin))+centerX)
            Xmaxb = ((xscale*(xmax))+centerX)
            
    # image min/max lat and lon       
    lat = np.array(( Yminb, Ymaxb )) #y
    lon = np.array(( Xminb, Xmaxb )) #x

    rasterTrimed[np.isnan(rasterTrimed)] = 9999
    
    return rasterTrimed, lat, lon
	
####################################
if __name__ == "__main__":

    import argparse
   
    # read command line args    
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--sourcefile", type=str, help="csv fiel to read from")
    parser.add_argument("-d", "--destinationfile", type=str, help="tiff file name and destination to write")
    parser.add_argument("-e", "--extent", type=lambda s: [float(item) for item in s.split(',')], help="raster min/max latitude & longitude; latmin latmax lonmin lonmax")
    parser.add_argument("-t", "--trim", action="store_true", help="trim rows/cols with only NA data from raster")
    args = parser.parse_args()
    
    # get command line arguments
    csvFile = args.sourcefile
    tiffPath = args.destinationfile
    latMin = args.extent[0]
    latMax = args.extent[1]
    lonMin = args.extent[2]
    lonMax = args.extent[3]
	
    # read csv file
    dataArray = np.recfromtxt(csvFile, dtype=float, delimiter=';')
   
    # lan/lon to numpy array add half of a raster cell to each dimesnion
    # to preserver resolution .5deg 
    lat = np.array((latMin-0.25, latMax+0.25))
    lon = np.array((lonMin-0.25, lonMax+0.25))
    
    
    if args.trim:
        # trim array to only data extend
        dataArray, lat, lon = trimRaster(dataArray, latMin, lonMin)
        
    # write geotiff    
    numpy2geotiff(dataArray, lat, lon, tiffPath)