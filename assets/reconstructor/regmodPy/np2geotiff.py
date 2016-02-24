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

    
# trim raster to actual data extent   
def trimRaster(raster, centerY, centerX, metadata = False):

    # padding factorfor raster to leave na border
    PADDINGMIN = 2
    PADDINGMAX = 2

    # take into according that raster has 0 step
    centerX += 0.5
    centerY += 0.5

    ymin = min(np.where(~np.isnan(raster))[0])
    ymax = max(np.where(~np.isnan(raster))[0])
    xmin = min(np.where(~np.isnan(raster))[1])
    xmax = max(np.where(~np.isnan(raster))[1])

    # leave NA data border
    if(xmin != 0):
        print 'GET IT'
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

        Yminb = ((yscale*(ymin))+centerY)
        Ymaxb = ((yscale*(ymax))+centerY)
        Xminb = ((xscale*(xmin))+centerX)
        Xmaxb = ((xscale*(xmax))+centerX)

    # image min/max lat and lon
    lat = np.array(( Yminb, Ymaxb )) #y
    lon = np.array(( Xminb, Xmaxb )) #x

#    rasterTrimed[np.isnan(rasterTrimed)] = 9999

    return rasterTrimed, lat, lon
